import { AnnealingOptions } from './annealer'
import { Annealer } from './annealer/Annealer'
import inputJobs from './data/jobs.json'
import { LineSetup } from './types/lines'
import { IOptimizationProblem } from './types/OptimizationProblem'
import { Move, MOVES, Schedule, ScheduleChange } from './types/schedule'
import { distance } from './utils/costFunctions'
import { dailyChangeCost, setupChangeCost, tardiness } from './utils/targetFunctions'

const jobs: number[] = []
const durations: number[] = []
const deadlines: number[] = []
const machineSetup: LineSetup[] = []
const compatibility: boolean[][] = []
const lines = ['3', '4', '5', '6', '10', '11', '12', '13']
const machines = [0, 1, 2, 3, 4, 5, 6, 7]

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
})

const instance: IOptimizationProblem = {
  machines,
  jobs,
  durations,
  compatibility,
  availability: [],
  deadlines,
  machineSetup,
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

  return (
    w1 * tardiness(solution, instance.durations, instance.deadlines) +
    w2 * setupChangeCost(solution, instance.machineSetup, distance) +
    w3 * dailyChangeCost(solution, instance.durations)
  )
}

async function chooseRandomChange(instance: IOptimizationProblem, solution: Schedule): Promise<Move> {
  const index = Math.floor(Math.random() * MOVES.length)
  const move = MOVES[index]

  switch (move) {
    case ScheduleChange.HORIZONTAL_ADJACENCY: {
      const swapRow = Math.floor(Math.random() * solution.length)
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
      const swapRow = Math.floor(Math.random() * solution.length)
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
        const swapRow = Math.floor(Math.random() * solution.length)
        const swapColumn = Math.floor(Math.random() * solution[swapRow].length)
        const nextRow = Math.floor(Math.random() * solution.length)
        const nextColumn = Math.floor(Math.random() * solution[nextRow].length)

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

const options: AnnealingOptions = {
  K: 1,
  initialTemp: 1000,
  stepsPerTemp: 2,
  coolingSteps: 100000,
  coolingFraction: 0.9997,
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

//f()

const annealer = new Annealer<IOptimizationProblem, Schedule, Move>(
  initialize,
  solutionValue,
  chooseRandomChange,
  transition
)

const main = async () => {
  const schedule = await annealer.anneal(instance, options)
  console.log(schedule, '\n', annealer.lastSolutionValue, solutionValue(instance, schedule))
}

main()
