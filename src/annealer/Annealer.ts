import { AnnealingOptions } from '.'

export class Annealer<I, S, SC> {
  private temperature: number
  private currentValue: number

  constructor(
    private initialize: (instance: I) => Promise<S>,
    private solutionValue: (instance: I, solution: S) => Promise<number>,
    private chooseRandomChange: () => Promise<SC>,
    private transition: (instance: I, prevSolution: S, changes: SC) => Promise<{ revertChange: SC; delta: number }>
  ) {
    this.temperature = 0.0
    this.currentValue = 0.0
  }

  public get lastSolutionValue(): number {
    return this.currentValue
  }

  async anneal(instance: I, options: AnnealingOptions): Promise<S> {
    this.temperature = options.initialTemp
    const solution = await this.initialize(instance)
    this.currentValue = await this.solutionValue(instance, solution)
    for (let i = 1; options.coolingSteps; i++) {
      this.cooldown(instance, solution, options)
    }

    return solution
  }

  private async cooldown(instance: I, solution: S, options: AnnealingOptions) {
    this.temperature = this.temperature * options.coolingFraction
    const startValue = this.currentValue

    for (let j = 1; j <= options.stepsPerTemp; j++) {
      const change = await this.chooseRandomChange()
      const flip = Math.random()
      const transition = await this.transition(instance, solution, change)
      const exponent = -transition.delta / this.currentValue / (options.K * this.temperature)
      const merit = Math.pow(Math.E, exponent)
      if (transition.delta > 0) {
        this.currentValue = this.currentValue + transition.delta
      } else if (merit > flip) {
        this.currentValue = this.currentValue + transition.delta
      } else {
        await this.transition(instance, solution, transition.revertChange)
      }
    }

    if (this.currentValue - startValue < 0.0) {
      this.temperature = this.temperature / options.coolingFraction
    }
  }
}
