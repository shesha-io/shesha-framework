using Abp.Dependency;
using Hangfire;
using Shesha.Scheduler.Attributes;
using Shesha.Scheduler.Domain.Enums;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Scheduler
{
    [ScheduledJob("1FF7882E-0A3B-4F88-A8B3-C3C20AFAFBDE", StartUpMode.Manual, LogMode = LogMode.StoredFile, LogFolder = "ThisJob/Awesome")]
    [DisableConcurrentExecution(30*60)]
    public class TestJob: ScheduledJobBase<TestJobStats>, ITransientDependency
    {
        public override Task DoExecuteAsync(CancellationToken cancellationToken)
        {
            Log.Info("Started...");
            

            for (int i = 0; i < 100; i++)
            {
                Thread.Sleep(100);
                Log.Info($"processing {i}");


                if (i % 2 == 0)
                {
                    JobStatistics.NumSucceeded++;

                }else if (i % 5 == 0)
                {
                    JobStatistics.NumErrors++;
                } else if (i % 3 == 0)
                {
                    JobStatistics.NumSkipped++;
                }
            }

            JobStatistics.TotalProcessedRecords = 100;

            //Log.Info($"TestJob.JobStatistics {JsonConvert.SerializeObject(JobStatistics)}");
            Log.Info($"TestJob.JobStatistics {JobStatistics.GetJson()}");
            Log.Info("Finished...");

            return Task.CompletedTask;
        }        
    }
}
