import { AnnealingOptions } from './annealer'
import { Annealer } from './annealer/Annealer'
import inputJobs from './data/jobs.json'
import { Cage } from './types/enumerations/LineElements'
import { Couvette, LineSetup } from './types/lines'
import { IOptimizationProblem } from './types/OptimizationProblem'
import { Move, MOVES, Schedule, ScheduleChange } from './types/schedule'
import { distance } from './utils/costFunctions'
import {
  cooldownHardLimit,
  dailyChangeCost,
  setupChangeCost,
  tardiness,
  weeklyChangeCost,
} from './utils/targetFunctions'

const jobs: number[] = []
const durations: number[] = []
const deadlines: number[] = []
const machineSetup: LineSetup[] = []
const compatibility: boolean[][] = []
const lines = ['3', '4', '5', '6', '10', '11', '12', '13']
const machines = [0, 1, 2, 3, 4, 5, 6, 7]
const couvetteCompatibilities: Couvette[][] = []
const cageCompatibilities: Cage[][] = []
const matricesJobs: number[][] = []

lines.forEach(() => {
  compatibility.push([])
})

inputJobs.forEach((job) => {
  jobs.push(job.id)
  durations.push(job.duration)
  deadlines.push(job.deadline)

  machineSetup.push(job.machineSetup as LineSetup)

  const compatible: boolean[] = []
  lines.forEach((line, index) => {
    compatibility[index].push(job.compatibleMachines.includes(line))
  })
  compatibility.push(compatible)
  couvetteCompatibilities.push(job.compatibleCouvettes as Couvette[])
  cageCompatibilities.push(job.compatibleCages as Cage[])
  matricesJobs.push(inputJobs.filter((j) => j.originalId === job.originalId).map((j) => j.id))
})

const instance: IOptimizationProblem = {
  machines,
  jobs,
  durations,
  compatibility,
  availability: [],
  deadlines,
  machineSetup,
  couvetteCompatibilities,
  cageCompatibilities,
  matricesJobs,
  cooldown: 10,
}

async function initialize(instance: IOptimizationProblem): Promise<Schedule> {
  const schedule: Schedule = []
  instance.machines.forEach(() => schedule.push([]))

  const jobsToSchedule = instance.jobs
  let line = 0

  while (jobsToSchedule.length > 0) {
    const randomIndex = Math.floor(Math.random() * jobsToSchedule.length)
    const job = jobsToSchedule[randomIndex]

    if (instance.compatibility[line][job]) {
      schedule[line].push(job)
      jobsToSchedule.splice(randomIndex, 1)
    }

    line = (line + 1) % instance.machines.length
  }

  return schedule
}

async function solutionValue(instance: IOptimizationProblem, solution: Schedule): Promise<number> {
  const w1 = 0.5
  const w2 = 0.2
  const w3 = 0.7
  const w4 = 0.7
  const w5 = 1.0

  return (
    w1 * tardiness(solution, instance.durations, instance.deadlines) +
    w2 * setupChangeCost(solution, instance.machineSetup, distance) +
    w3 * dailyChangeCost(solution, instance.durations) +
    w4 * weeklyChangeCost(solution, instance.durations) +
    w5 * cooldownHardLimit(solution, instance.durations, instance.matricesJobs, instance.cooldown)
  )
}

async function chooseRandomChange(instance: IOptimizationProblem, solution: Schedule): Promise<Move> {
  const index = Math.floor(Math.random() * MOVES.length)
  const move = MOVES[index]

  switch (move) {
    case ScheduleChange.HORIZONTAL_ADJACENCY: {
      let swapRow = Math.floor(Math.random() * solution.length)
      while (solution[swapRow].length === 0) {
        swapRow = Math.floor(Math.random() * solution.length)
      }

      const swapColumn = Math.floor(Math.random() * solution[swapRow].length)
      const nextColumn = swapColumn === solution[swapRow].length ? swapColumn - 1 : swapColumn + 1
      return {
        i: swapRow,
        j: swapColumn,
        p: swapRow,
        q: nextColumn,
      }
    }
    case ScheduleChange.VERTICAL_ADJACENCY: {
      while (true) {
        const swapRow = Math.floor(Math.random() * solution.length)
        const swapColumn = Math.floor(Math.random() * solution[swapRow].length)
        const nextRow = (swapRow + 1) % solution.length
        const nextColumn = swapColumn < solution[nextRow].length ? swapColumn : solution[nextRow].length

        const swapJob1 = solution[swapRow][swapColumn]
        const swapJob2 = solution[nextRow][nextColumn]
        const compatible = instance.compatibility[nextRow][swapJob1] && instance.compatibility[swapRow][swapJob2]

        if (compatible) {
          return {
            i: swapRow,
            j: swapColumn,
            p: nextRow,
            q: nextColumn,
          }
        }
      }
    }
    case ScheduleChange.SAME_LINE: {
      let swapRow = Math.floor(Math.random() * solution.length)
      while (solution[swapRow].length === 0) {
        swapRow = Math.floor(Math.random() * solution.length)
      }
      const swapColumn = Math.floor(Math.random() * solution[swapRow].length)
      const nextColumn = Math.floor(Math.random() * solution[swapRow].length)
      return {
        i: swapRow,
        j: swapColumn,
        p: swapRow,
        q: nextColumn,
      }
    }
    case ScheduleChange.RANDOM: {
      while (true) {
        let swapRow = Math.floor(Math.random() * solution.length)
        while (solution[swapRow].length === 0) {
          swapRow = Math.floor(Math.random() * solution.length)
        }
        const swapColumn = Math.floor(Math.random() * solution[swapRow].length)
        const nextRow = Math.floor(Math.random() * solution.length)
        const nextColumn = Math.floor(Math.random() * solution[nextRow].length)

        const swapJob1 = solution[swapRow][swapColumn]
        const swapJob2 = solution[nextRow][nextColumn]
        const compatible =
          instance.compatibility[nextRow][swapJob1] &&
          (swapJob2 === undefined || instance.compatibility[swapRow][swapJob2])

        if (compatible) {
          return {
            i: swapRow,
            j: swapColumn,
            p: nextRow,
            q: nextColumn,
          }
        }
      }
    }
  }
}

async function transition(instance: IOptimizationProblem, prevSolution: Schedule, changes: Move) {
  const { i, j, p, q } = changes
  const temp = prevSolution[i][j]
  if (q === prevSolution[p].length) {
    prevSolution[p].push(temp)
    prevSolution[i].splice(j, 1)
  } else {
    prevSolution[i][j] = prevSolution[p][q]
    prevSolution[p][q] = temp
  }

  return changes
}

function errorThrower(solution: Schedule) {
  for (let i = 0; i < solution.length; i++) {
    for (let j = 0; j < solution[i].length; j++) {
      if (solution[i][j] === undefined || solution[i][j] < 0) {
        throw Error
      }
    }
  }
}

const options: AnnealingOptions = {
  K: 1,
  initialTemp: 1000,
  stepsPerTemp: 5,
  coolingSteps: 100000,
  coolingFraction: 0.9997,
}

function printTimeUsage(schedule: Schedule, durations: number[]) {
  for (let i = 0; i < schedule.length; i++) {
    let scheduleLineString = ''
    for (let j = 0; j < schedule[i].length; j++) {
      const job = schedule[i][j]
      for (let j = 0; j < durations[job]; j++) {
        scheduleLineString += '#'
      }
    }
    console.log(scheduleLineString)
  }
}

const _f = async () => {
  const firstSolution = await initialize(instance)
  console.log(firstSolution)
  console.log('SOLUTION VALUE: ', await solutionValue(instance, firstSolution))
  const changes = await chooseRandomChange(instance, firstSolution)
  console.log('CHOSE RANDOM CHANGE: ', changes)
  console.log('TRANSITION', await transition(instance, firstSolution, changes))
  console.log('NEXT SOLUTION', firstSolution)
}

const annealer = new Annealer<IOptimizationProblem, Schedule, Move>(
  initialize,
  solutionValue,
  chooseRandomChange,
  transition
)

const main = async () => {
  annealer.printProgress(true, 1000)
  annealer.setErrorThrower(errorThrower)
  const schedule = await annealer.anneal(instance, options)
  console.log(schedule)
  console.log('Worst:', annealer.worstSolutionValue)
  console.log('Last:', annealer.lastSolutionValue)
  printTimeUsage(schedule, instance.durations)
}

main()
