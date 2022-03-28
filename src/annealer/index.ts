import {
  CAGE_CHANGE_COST,
  COUVETTE_CHANGE_COST,
  HEIGHT_CHANGE_COST,
  REMELTING_MACHINE_CHANGE_COST,
  SHAPE_CHANGE_COST,
} from '../constants/changeCosts'
import { Cage, Height, Shape } from '../types/enumerations/LineElements'
import { Couvette, LineSetup, LineSetupCost, Schedule } from '../types/lines'

export type AnnealingOptions = {
  initialTemp: number
  coolingSteps: number
  coolingFraction: number
  stepsPerTemp: number
  K: number
}

export const TARGET_FUNCTIONS = {
  tardiness: (schedule: Schedule, durations: number[], deadlines: number[]) => {
    let sum = 0
    for (const line of schedule) {
      let startTime = 0
      for (const job of line) {
        sum += Math.max(0, startTime + durations[job] - deadlines[job])
        startTime += durations[job]
      }
    }
    return sum
  },
  setupCost: (schedule: Schedule, machineSetup: LineSetup[], costFunctions: LineSetupCost) => {
    let sum = 0
    const { height, shape, cage, couvette, remeltingMachine } = costFunctions

    for (const line of schedule) {
      let previousSetup = null
      for (const job of line) {
        if (previousSetup === null) {
          previousSetup = machineSetup[job]
          continue
        }

        const currentSetup = machineSetup[job]

        sum +=
          height(previousSetup.height, currentSetup.height) +
          shape(previousSetup.shape, currentSetup.shape) +
          cage(previousSetup.cage, currentSetup.cage) +
          couvette(previousSetup.couvette, currentSetup.couvette) +
          remeltingMachine(previousSetup.remeltingMachine, currentSetup.remeltingMachine)
      }
    }
    return sum
  },
}

export const COST_FUNCTIONS: LineSetupCost = {
  height: (prev: Height, curr: Height) => (prev === curr ? 0 : HEIGHT_CHANGE_COST),
  shape: (prev: Shape, curr: Shape) => (prev === curr ? 0 : SHAPE_CHANGE_COST),
  cage: (prev: Cage, curr: Cage) => (prev === curr ? 0 : CAGE_CHANGE_COST),
  couvette: (prev: Couvette, curr: Couvette) => Math.abs(curr - prev) * COUVETTE_CHANGE_COST,
  remeltingMachine: (prev: boolean, curr: boolean) => (prev === curr ? 0 : REMELTING_MACHINE_CHANGE_COST),
}
