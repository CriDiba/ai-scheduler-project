import {
  CAGE_CHANGE_COST,
  COUVETTE_CHANGE_COST,
  HEIGHT_CHANGE_COST,
  REMELTING_MACHINE_CHANGE_COST,
  SHAPE_CHANGE_COST,
} from '../constants/changeCosts'
import { Cage, Height, Shape } from '../types/enumerations/LineElements'
import { Couvette } from '../types/lines'

export const height = (prev: Height, curr: Height) => (prev === curr ? 0 : HEIGHT_CHANGE_COST)
export const shape = (prev: Shape, curr: Shape) => (prev === curr ? 0 : SHAPE_CHANGE_COST)
export const cage = (prev: Cage, curr: Cage) => (prev === curr ? 0 : CAGE_CHANGE_COST)
export const couvette = (prev: Couvette, curr: Couvette) => Math.abs(curr - prev) * COUVETTE_CHANGE_COST
export const remeltingMachine = (prev: boolean, curr: boolean) => (prev === curr ? 0 : REMELTING_MACHINE_CHANGE_COST)
