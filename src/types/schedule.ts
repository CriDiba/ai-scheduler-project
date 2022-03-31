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
