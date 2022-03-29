import { MAX_CHANGES_VIOLATION_COST } from '../constants/changeCosts'
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

export function dailyChangeCost(schedule: Schedule, durations: number[]) {
  const dailyChanges = Array(1000).fill(0)

  for (const line of schedule) {
    let date = 0
    for (const job of line) {
      dailyChanges[date]++
      date += durations[job]
    }
  }

  const violations = dailyChanges.reduce((totalViolations, currentChanges, index) => {
    if (index !== 0) {
      return currentChanges > 2 ? totalViolations + 1 : totalViolations
    }
    return totalViolations
  }, 0)

  return MAX_CHANGES_VIOLATION_COST * violations
}
