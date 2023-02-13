using System;
using System.Threading;
using System.Threading.Tasks;
using Abp.Dependency;
using Abp.Domain.Uow;
using Hangfire;
using Newtonsoft.Json;
using Shesha.Scheduler.Attributes;
using Shesha.Scheduler.Domain.Enums;
using Shesha.Scheduler.Logging;

namespace Shesha.Scheduler
{
    [ScheduledJob("1FF7882E-0A3B-4F88-A8B3-C3C20AFAFBDE", StartUpMode.Manual, LogMode = LogMode.StoredFile, LogFolder = "ThisJob/Awesome")]
    [DisableConcurrentExecution(30*60)]
    public class TestJob: ScheduledJobBase<TestJobStats>, ITransientDependency
    {
        //[UnitOfWork(IsDisabled = true)]
        public override async Task DoExecuteAsync(CancellationToken cancellationToken)
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
        }

        public override async Task OnSuccess()
        {
            Log.Info("TestJob.OnSuccess executed.");
        }

        public override async Task OnFail(Exception ex)
        {
            Log.Info("TestJob.OnFail executed");
        }

        public override void OnLog(object sender, ScheduledJobOnLogEventArgs e)
        {
            Log.Info("TestJob.OnLog executed");
        }
    }
}
