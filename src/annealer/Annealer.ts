import { AnnealingOptions } from '.'

export class Annealer<I, S, SC> {
  private temperature: number
  private currentValue: number
  private _worstSolutionValue: number
  private _printProgress: boolean
  private _printSteps: number
  private _errorThrower: ((solution: S) => void) | undefined = undefined

  constructor(
    private initialize: (instance: I) => Promise<S>,
    private solutionValue: (instance: I, solution: S) => Promise<number>,
    private chooseRandomChange: (instance: I, solution: S) => Promise<SC>,
    private transition: (instance: I, prevSolution: S, changes: SC) => Promise<SC>
  ) {
    this.temperature = 0.0
    this.currentValue = 0.0
    this._worstSolutionValue = Number.POSITIVE_INFINITY
    this._printProgress = false
    this._printSteps = 1
  }

  public get worstSolutionValue(): number {
    return this._worstSolutionValue
  }

  public get lastSolutionValue(): number {
    return this.currentValue
  }

  public printProgress(value: boolean, steps = 1) {
    this._printProgress = value
    this._printSteps = steps
  }

  public setErrorThrower(errorThrower?: (solution: S) => void) {
    this._errorThrower = errorThrower
  }

  async anneal(instance: I, options: AnnealingOptions): Promise<S> {
    this.temperature = options.initialTemp
    const solution = await this.initialize(instance)
    this.currentValue = await this.solutionValue(instance, solution)
    this._worstSolutionValue = this.currentValue
    for (let i = 0; i < options.coolingSteps; i++) {
      await this.cooldown(instance, solution, options)
      if (this._printProgress && i % this._printSteps === 0) {
        console.log('temperature:', this.temperature, 'currentValue:', this.currentValue)
      }

      try {
        this._errorThrower?.(solution)
      } catch (error) {
        console.log('An error has occurred:', error)
        console.log('Stopping annealer at iteration:', i)
        return solution
      }
    }

    return solution
  }

  private async cooldown(instance: I, solution: S, options: AnnealingOptions) {
    this.temperature = this.temperature * options.coolingFraction

    for (let j = 1; j <= options.stepsPerTemp; j++) {
      const change = await this.chooseRandomChange(instance, solution)
      const flip = Math.random()
      const revertChange = await this.transition(instance, solution, change)
      const delta = (await this.solutionValue(instance, solution)) - this.currentValue
      const exponent = -delta / (options.K * this.temperature)
      const merit = Math.pow(Math.E, exponent)
      if (delta < 0) {
        this.currentValue = this.currentValue + delta
      } else if (merit > flip) {
        this.currentValue = this.currentValue + delta
      } else {
        await this.transition(instance, solution, revertChange)
      }

      this._worstSolutionValue = Math.max(this.currentValue, this._worstSolutionValue)
    }
  }
}
