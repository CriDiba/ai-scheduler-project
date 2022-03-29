import { Annealer } from './annealer/Annealer'
import inputJobs from './data/jobs.json'
import { LineSetup } from './types/lines'
import { IOptimizationProblem } from './types/OptimizationProblem'
import { Schedule } from './types/schedule'
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
  const w1 = 1
  const w2 = 1
  const w3 = 1

  return (
    w1 * tardiness(solution, instance.durations, instance.deadlines) +
    w2 * setupChangeCost(solution, instance.machineSetup, distance) +
    w3 * dailyChangeCost(solution, instance.durations)
  )
}

const f = async () => {
  const firstSolution = await initialize(instance)
  console.log(firstSolution)
  console.log('SOLUTION VALUE: ', solutionValue(instance, firstSolution))
}

f()
