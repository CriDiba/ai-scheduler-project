import { couvettes } from '../constants'
import { Cage, Height, Shape } from '../types/enumerations/LineElements'
import { Couvette } from '../types/lines'

export function readCage(cage: Cage) {
  return cage === Cage.CAGE_5 ? 'CAGE_5' : 'CAGE_6'
}

export function readHeight(height: Height) {
  return height === Height.LESS_THAN_80 ? 'LESS_THAN_80' : 'GREATER_THAN_80'
}

export function readCouvette(couvette: Couvette) {
  return couvettes[couvette]
}

export function readShape(shape: Shape) {
  return shape === Shape.MOLDED ? 'Moulded' : 'Rounded'
}
