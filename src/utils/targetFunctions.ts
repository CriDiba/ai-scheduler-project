import { LineSetup, LineSetupDistance } from '../types/lines'
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

export function setupChangeCost(schedule: Schedule, machineSetup: LineSetup[], distance: LineSetupDistance) {
  let sum = 0

  for (const line of schedule) {
    let previousSetup = null
    for (const job of line) {
      if (previousSetup === null) {
        previousSetup = machineSetup[job]
        continue
      }

      const currentSetup = machineSetup[job]

      sum += distance(previousSetup, currentSetup)
    }
  }
  return sum
}
