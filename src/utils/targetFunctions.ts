import {
  COOLDOWN_NOT_RESPECTED_COST,
  MAX_DAILY_CHANGES_VIOLATION_COST,
  MAX_WEEKLY_CHANGES_VIOLATION_COST,
} from '../constants/changeCosts'
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

  return MAX_DAILY_CHANGES_VIOLATION_COST * violations
}

export function weeklyChangeCost(schedule: Schedule, durations: number[]) {
  const dailyChanges = Array(1000).fill(0)

  for (const line of schedule) {
    let date = 0
    for (const job of line) {
      dailyChanges[date]++
      date += durations[job]
    }
  }

  let violations = 0
  for (let i = 0; i < dailyChanges.length; i += 7) {
    let changes = 0
    for (let j = i; j < Math.max(i + 7, dailyChanges.length); j++) {
      changes += dailyChanges[j]
    }
    if (changes > 5) {
      violations++
    }
  }
  return MAX_WEEKLY_CHANGES_VIOLATION_COST * violations
}

export function cooldownHardLimit(schedule: Schedule, durations: number[], matricesJobs: number[][], cooldown: number) {
  let conflicts = 0
  const seenJobs = new Set<number>()

  const durationSchedule: number[][] = []
  for (let i = 0; i < schedule.length; i++) {
    let cumulativeDuration = 0
    durationSchedule.push([])
    for (let j = 0; j < schedule[i].length; j++) {
      const job = schedule[i][j]
      cumulativeDuration += durations[job]
      durationSchedule[i].push(cumulativeDuration)
    }
  }

  for (let i = 0; i < matricesJobs.length; i++) {
    if (seenJobs.has(i)) {
      continue
    }

    matricesJobs[i].forEach((j) => seenJobs.add(j))
    seenJobs.add(i)

    const dates: { start: number; end: number }[] = []
    for (let i = 0; i < schedule.length; i++) {
      for (const job of matricesJobs[i]) {
        const indexOfJob = schedule[i].indexOf(job)
        if (indexOfJob !== -1) {
          const startDate = indexOfJob === 0 ? 0 : durationSchedule[i][indexOfJob - 1]
          dates.push({ start: startDate, end: durationSchedule[i][indexOfJob] })
        }
      }
    }

    for (let i = 0; i < dates.length; i++) {
      for (let j = i + 1; j < dates.length; j++) {
        const firstJob = dates[i]
        const secondJob = dates[j]
        if (firstJob.start <= secondJob.end && secondJob.start <= firstJob.end) {
          conflicts++
        } else {
          if (firstJob.end <= secondJob.start && secondJob.start - firstJob.end < cooldown) {
            conflicts++
          } else if (secondJob.end <= firstJob.start && firstJob.start - secondJob.end < cooldown) {
            conflicts++
          }
        }
      }
    }
  }

  return COOLDOWN_NOT_RESPECTED_COST * conflicts
}
