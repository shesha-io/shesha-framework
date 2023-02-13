using Hangfire;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Scheduler
{
    /// <summary>
    /// Scheduled jobs manager
    /// </summary>
    public interface IScheduledJobManager
    {
        /// <summary>
        /// Enqueue all jobs using Hangfire
        /// </summary>
        Task EnqueueAllAsync();

        /// <summary>
        /// Get job type by trigger Id
        /// </summary>
        /// <param name="triggerId">Trigger Id</param>
        /// <returns></returns>
        Type GetJobType(Guid triggerId);

        /// <summary>
        /// Run job
        /// </summary>
        /// <param name="jobId">Job id</param>
        /// <param name="executionId">executionId</param>
        /// <param name="startedById">Id of the started user</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <param name="jobName"></param>
        /// <returns></returns>
        [JobDisplayName("{4}")]
        Task RunJobAsync(Guid jobId, Guid executionId, Int64? startedById, CancellationToken cancellationToken, string jobName);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="jobId"></param>
        /// <param name="jobType"></param>
        /// <param name="executionId"></param>
        /// <param name="startedById"></param>
        /// <param name="cancellationToken"></param>
        /// <param name="jobName"></param>
        /// <returns></returns>
        [JobDisplayName("{5}")]
        Task RunJobAsync(Guid jobId, string jobType, Guid executionId, Int64? startedById, CancellationToken cancellationToken, string jobName);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="jobId"></param>
        /// <param name="jobType"></param>
        /// <param name="methodName"></param>
        /// <param name="methodArgs"></param>
        /// <returns></returns>
        Task ExecuteJobMethodAsync(Guid jobId, string jobType, string methodName, object?[]? methodArgs);

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

    }
}
