using Hangfire;
using Hangfire.Server;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Scheduler
{
    public interface IScheduledJobRunner
    {
        /// <summary>
        /// Run job
        /// </summary>
        /// <param name="jobName">Friendly job name</param>
        /// <param name="envelope">Job envelope</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <param name="context">Execution context. Handler by Hangfire, pass null and it'll be replaced automatically</param>
        /// <returns></returns>
        [JobDisplayName("{0}")]
        [AutomaticRetry(Attempts = 0)]
        Task RunJobAsync(string jobName, JobEnvelope envelope, CancellationToken cancellationToken, PerformContext context = null);

        /// <summary>
        /// Run job trigger
        /// </summary>
        /// <param name="jobName">Friendly job name</param>
        /// <param name="triggerId">Job trigger Id</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <param name="context"></param>
        /// <returns></returns>
        [JobDisplayName("{0}")]
        [AutomaticRetry(Attempts = 0)]
        Task RunTriggerAsync(string jobName, Guid triggerId, CancellationToken cancellationToken, PerformContext context = null);

        /// <summary>
        /// Get job type by Id
        /// </summary>
        /// <param name="id">Job Id</param>
        /// <returns></returns>
        Type GetJobTypeById(Guid id);

        /// <summary>
        /// Get job instance by Id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        ScheduledJobBase GetJobInstanceById(Guid id);

        /// <summary>
        /// Pre-create execution record
        /// </summary>
        /// <param name="executionId">Id of execution record to create</param>
        /// <param name="jobId">Job Id</param>
        /// <param name="triggerId">optional trigger Id</param>
        /// <param name="startedById">Id of the started user</param>
        /// <returns></returns>
        Task PreCreateExecutionRecordAsync(Guid executionId, Guid jobId, Guid? triggerId, Int64? startedById);
    }
}
