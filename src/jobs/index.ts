import Cron from "node-cron"

interface Job {
  id: number
  cronString: string
}

class JobController {
  private jobs: Cron.ScheduledTask[] = []

  public create(jobFunction: () => void, cronString: string): void {
    const job = Cron.schedule(cronString, jobFunction)

    jobFunction()

    this.jobs.push(job)
  }

  public stopAll(): void {
    this.jobs.forEach((job) => job.stop())
  }

  public startAll(): void {
    this.jobs.forEach((job) => job.start())
  }

  public listJobs(): Job[] {
    return this.jobs.map((job, index) => ({
      id: index,
      cronString: (job as any)._task.schedule,
    }))
  }
}

export default JobController
