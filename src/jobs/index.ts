import Cron from 'node-cron';

interface Job {
  id: number
  cronString: string
}

class JobController {
  private jobs: { task: Cron.ScheduledTask; cronString: string }[] = [];

  public create(jobFunction: () => void, cronString: string): void {
    const job = Cron.schedule(cronString, jobFunction);
    jobFunction();
    this.jobs.push({ task: job, cronString });
  }

  public stopAll(): void {
    this.jobs.forEach(({ task }) => task.stop());
  }

  public startAll(): void {
    this.jobs.forEach(({ task }) => task.start());
  }

  public listJobs(): Job[] {
    return this.jobs.map((job, index) => ({
      id: index,
      cronString: job.cronString,
    }));
  }
}

export default JobController;
