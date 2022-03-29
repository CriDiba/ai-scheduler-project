import inputJobs from './data/jobs.json'

const jobs = []
const durations = []
const deadlines = []
const machineSetup = []
const compatibility = []
const machines = ['3', '4', '5', '6', '10', '11', '12', '13']

inputJobs.forEach((job) => {
  jobs.push(job.id)
  durations.push(job.duration)
  deadlines.push(job.deadline)
  machineSetup.push(job.machineSetup)
})
