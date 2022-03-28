import { LineSetup, LineSetupCost } from '../types/lines'
import { Schedule } from '../types/schedule'

export function tardiness(schedule: Schedule, durations: number[], deadlines: number[]) {
  let sum = 0
  for (const line of schedule) {
    let startTime = 0
    for (const job of line) {
      sum += Math.max(0, startTime + durations[job] - deadlines[job])
      startTime += durations[job]
    }
  }
  return sum
}

export function setupChangeCost(schedule: Schedule, machineSetup: LineSetup[], costFunctions: LineSetupCost) {
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
}
