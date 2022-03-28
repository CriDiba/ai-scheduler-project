import {
  CAGE_CHANGE_COST,
  COUVETTE_CHANGE_COST,
  HEIGHT_CHANGE_COST,
  REMELTING_MACHINE_CHANGE_COST,
  SHAPE_CHANGE_COST,
} from '../constants/changeCosts'
import { LineSetup } from '../types/lines'

export function distance(prev: LineSetup, curr: LineSetup) {
  let d = Math.abs(curr.couvette - prev.couvette) * COUVETTE_CHANGE_COST
  if (curr.height !== prev.height) {
    d += HEIGHT_CHANGE_COST
  }
  if (curr.shape !== prev.shape) {
    d += SHAPE_CHANGE_COST
  }
  if (curr.cage !== prev.cage) {
    d += CAGE_CHANGE_COST
  }
  if (curr.remeltingMachine !== prev.remeltingMachine) {
    d += REMELTING_MACHINE_CHANGE_COST
  }

  return d
}
