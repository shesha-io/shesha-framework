using Abp.Dependency;
using Hangfire;
using Shesha.Scheduler.Attributes;
using Shesha.Scheduler.Domain.Enums;
using System;
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
                    Log.Error("Test error", new Exception(@"Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Curabitur eget ligula commodo, maximus ex vitae, finibus libero. Mauris congue mi mauris, vitae mollis massa mollis et.
Praesent a erat hendrerit, blandit nulla eget, ornare ante. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed scelerisque nulla id mattis bibendum. Vestibulum ut luctus magna. Donec elementum metus sit amet mauris mollis dapibus. Aenean ut lacus augue. Nullam posuere ultrices nisi."));
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
