import { Cage } from './enumerations/LineElements'
import { Couvette, LineSetup } from './lines'

export type Job = {
  id: number
  originalId: string
  duration: number
  deadline: number
  compatibleMachines: string[]
  compatibleCages: Cage[]
  compatibleCouvettes: Couvette[]
  machineSetup: LineSetup
}
