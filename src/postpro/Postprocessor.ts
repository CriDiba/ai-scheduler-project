import dayjs from 'dayjs'
import fs from 'fs'
import { lines } from '../constants'
import input from '../prepro/input.json'
import { IOptimizationProblem } from '../types/OptimizationProblem'
import { Schedule, ScheduleEntry } from '../types/schedule'
import { readCage, readCouvette, readHeight, readShape } from '../utils/converters'
import jobs from '../data/jobs.json'

export const informativeSchedule = (schedule: Schedule, instance: IOptimizationProblem) => {
  const scheduleEntries: ScheduleEntry[] = []

  for (let i = 0; i < schedule.length; i++) {
    let startDate = dayjs().startOf('day').add(6, 'hours')
    for (let j = 0; j < schedule[i].length; j++) {
      const matrixId = schedule[i][j]
      const endDate = startDate.add(instance.durations[matrixId], 'day')
      const matrix = input.stockBreakMatrices.find((m) => m._id === jobs[matrixId].originalId)

      if (matrix === undefined) {
        continue
      }

      const machineSetup = instance.machineSetup[matrixId]
      scheduleEntries.push({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        lineCode: lines[i],
        matrixCode: matrix.matrixCode,
        startTurn: '1',
        endTurn: '3',
        amount: matrix.amount,
        machineSetup: {
          couvette: readCouvette(machineSetup.couvette),
          cage: readCage(machineSetup.cage),
          shape: readShape(machineSetup.shape),
          heightConfig: readHeight(machineSetup.height),
          remeltingMachine: machineSetup.remeltingMachine,
        },
        compatibleCages: instance.cageCompatibilities[matrixId].map((c) => readCage(c)),
        glassCode: matrix.matrixCode,
        compatibleCouvettes: instance.couvetteCompatibilities[matrixId].map((c) => readCouvette(c)),
        commissionReference: '',
        endNoteCode: '',
        endNoteDescription: '',
        feederStrokes: matrix.feederStrokes,
        feederStrokesBudget: matrix.feederStrokesBudget,
        furnacePullout: matrix.height * matrix.feederStrokes,
        initialNoteCode: '',
        initialNoteDescription: '',
        metaData: '',
        note: '',
        productCode: matrix.products[0],
        productName: '',
        productionConfirmed: false,
        status: 'Scheduled',
        type: 'Production',
      })
      startDate = endDate
    }
  }

  fs.createWriteStream('out.json').write(JSON.stringify(scheduleEntries))
}
