import { setupChangeCost, tardiness } from '../utils/targetFunctions'

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
