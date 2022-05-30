import { LineSetup } from './lines'

export type Job = {
  id: number
  originalId: string
  duration: number
  deadline: number
  compatibleMachines: string[]
  machineSetup: LineSetup
}
