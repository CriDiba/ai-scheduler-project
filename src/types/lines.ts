import { Cage, Height, Shape } from './enumerations/LineElements'

export type Couvette = 0 | 1 | 2 | 3 | 4 | 5

export type LineSetup = {
  height: Height
  shape: Shape
  cage: Cage
  couvette: Couvette
  remeltingMachine: boolean
}

export type LineSetupDistance = (prev: LineSetup, curr: LineSetup) => number
