import { LineSetupCost } from '../types/lines'
import { setupChangeCost, tardiness } from '../utils/targetFunctions'
import { height, shape, cage, couvette, remeltingMachine } from '../utils/costFunctions'

export type AnnealingOptions = {
  initialTemp: number
  coolingSteps: number
  coolingFraction: number
  stepsPerTemp: number
  K: number
}

export const TARGET_FUNCTIONS = {
  tardiness,
  setupChangeCost,
}

export const COST_FUNCTIONS: LineSetupCost = {
  height,
  shape,
  cage,
  couvette,
  remeltingMachine,
}
