export type Schedule = Array<Array<number>>

export type Move = {
  i: number
  j: number
  p: number
  q: number
}

export enum ScheduleChange {
  HORIZONTAL_ADJACENCY,
  VERTICAL_ADJACENCY,
  SAME_LINE,
  RANDOM,
}

export const MOVES = [
  ScheduleChange.HORIZONTAL_ADJACENCY,
  ScheduleChange.VERTICAL_ADJACENCY,
  ScheduleChange.SAME_LINE,
  ScheduleChange.RANDOM,
]

export type ScheduleEntry = {
  lineCode: string
  productCode: string
  glassCode: string
  matrixCode: string
  productName: string
  status: string
  type: string
  startDate: string
  endDate: string
  amount: number
  startTurn: string
  endTurn: string
  initialNoteCode: string
  initialNoteDescription: string
  endNoteCode: string
  endNoteDescription: string
  commissionReference: string
  feederStrokes: number
  feederStrokesBudget: number
  machineSetup: Partial<{
    couvette: string
    cage: string
    heightConfig: string
    shape: string
    remeltingMachine: boolean
  }>
  note: string
  compatibleCages: string[]
  compatibleCouvettes: string[]
  productionConfirmed: boolean
  metaData: string
  weight?: number
  furnacePullout: number
  goodPiecesPerHour?: number
  goodPiecesPerHourBudget?: number
  wastePiecesPerHour?: number
  wastePiecesPerHourBudget?: number
  oee?: number
  sampling?: boolean
}
