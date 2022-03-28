import { LineSetup } from './lines'

export interface IOptimizationProblem {
  machines: number[]
  jobs: number[]
  durations: number[]
  compatibility: boolean[][]
  availability: boolean[][]
  deadlines: number[]
  machineSetup: LineSetup[]
}
