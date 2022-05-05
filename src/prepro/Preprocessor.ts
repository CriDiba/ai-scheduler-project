import fs from 'fs'
import { couvettes } from '../constants'
import { Cage, Height, Shape } from '../types/enumerations/LineElements'
import { Job } from '../types/job'
import { Couvette } from '../types/lines'
import input from './input.json'

const jobs: Job[] = []

const stream = fs.createWriteStream('./data/jobs.json')

function mode(numbers: number[]) {
  // as result can be bimodal or multi-modal,
  // the returned result is provided as an array
  // mode of [3, 5, 4, 4, 1, 1, 2, 3] = [1, 3, 4]
  const modes: number[] = []
  const count: { [x: number]: number } = {}
  let number: number
  let maxIndex = 0

  for (let i = 0; i < numbers.length; i += 1) {
    number = numbers[i]
    count[number] = (count[number] || 0) + 1
    if (count[number] > maxIndex) {
      maxIndex = count[number]
    }
  }

  for (const i in count) {
    if (count.hasOwnProperty(i)) {
      if (count[i] === maxIndex) {
        modes.push(Number(i))
      }
    }
  }

  return modes
}

input.stockBreakMatrices.forEach((matrix) => {
  let duration = mode(matrix.linesOccupation.map((l) => l.occupation))[0]
  const durationLimit = input.parameters.maximumProductionDays - 2 // heuristic
  const durationMin = input.parameters.minimumProductionDays
  const durations: number[] = []
  while (duration > durationLimit) {
    duration = duration - durationLimit
    durations.push(durationLimit)
  }
  durations.push(Math.max(duration, durationMin))

  durations.forEach((d) => {
    jobs.push({
      id: jobs.length,
      originalId: matrix._id,
      duration: d,
      deadline: matrix.daysUntilStockBreak,
      compatibleMachines: matrix.linesCompatibility.filter((x) => x.compatible).map((x) => x.lineCode),
      compatibleCages: matrix.compatibleCages.map((c) => (c === 'CAGE_5' ? Cage.CAGE_5 : Cage.CAGE_6)),
      compatibleCouvettes: matrix.compatibleCouvettes.map((c) => couvettes.indexOf(c) as Couvette),
      machineSetup: {
        height: matrix.height <= 80 ? Height.LESS_THAN_80 : Height.MORE_THAN_80,
        shape: matrix.shape === 'Moulded' ? Shape.MOLDED : Shape.ROUNDED,
        cage: matrix.defaultSetup.cage === 'CAGE_5' ? Cage.CAGE_5 : Cage.CAGE_6,
        couvette: couvettes.indexOf(matrix.defaultSetup.couvette) as Couvette,
        remeltingMachine: matrix.remeltingMachine,
      },
    })
  })
})

stream.write(JSON.stringify(jobs))
