import { Cage } from './enumerations/LineElements'
import { Couvette, LineSetup } from './lines'

export interface IOptimizationProblem {
  machines: number[]
  jobs: number[]
  durations: number[]
  compatibility: boolean[][]
  availability: boolean[][]
  deadlines: number[]
  machineSetup: LineSetup[]
  matricesJobs: number[][]
  cooldown: number
}
