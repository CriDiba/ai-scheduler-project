import { Cage, Height, Shape } from './enumerations/LineElements'

export type Couvette = 0 | 1 | 2 | 3 | 4

export type LineSetup = {
  height: Height
  shape: Shape
  cage: Cage
  couvette: Couvette
  remeltingMachine: boolean
}

export type LineSetupCost = {
  height: (prev: Height, curr: Height) => number
  shape: (prev: Shape, curr: Shape) => number
  cage: (prev: Cage, curr: Cage) => number
  couvette: (prev: Couvette, curr: Couvette) => number
  remeltingMachine: (prev: boolean, curr: boolean) => number
}

export type Schedule = Array<Array<number>>
