using System;
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
        /// Get job Id
        /// </summary>
        /// <typeparam name="TJob">Job type</typeparam>
        /// <returns></returns>
        Guid GetJobId<TJob>() where TJob: ScheduledJobBase;

        /// <summary>
        /// Enqueue job
        /// </summary>
        /// <param name="jobId">Id of the job to start</param>
        /// <param name="executionId">Id of job execution to create</param>
        /// <param name="startedById">Id of the user who started the job</param>
        /// <returns></returns>
        Task EnqeueJobAsync(Guid jobId, Guid executionId, Int64? startedById);

        /// <summary>
        /// Enqueue job
        /// </summary>
        /// <typeparam name="TJob">Job type</typeparam>
        /// <param name="executionId">Id of job execution to create</param>
        /// <param name="startedById">Id of the user who started the job</param>
        /// <returns></returns>
        Task EnqeueJobAsync<TJob>(Guid executionId, Int64? startedById) where TJob : ScheduledJobBase;

        /// <summary>
        /// Enqueue job
        /// </summary>
        /// <typeparam name="TJob">Job type</typeparam>
        /// <typeparam name="TParams">Job parameters type</typeparam>
        /// <param name="executionId">Id of job execution to create</param>
        /// <param name="startedById">Id of the user who started the job</param>
        /// <param name="jobParams">Job parameters</param>
        /// <returns></returns>
        Task EnqeueJobAsync<TJob, TParams>(Guid executionId, Int64? startedById, TParams jobParams) where TJob : ScheduledJobBase, IParametrizedJob<TParams>
            where TParams: class, new();

        /// <summary>
        /// Enqueue job trigger
        /// </summary>
        /// <param name="triggerId">Trigger Id</param>
        /// <returns></returns>
        Task EnqeueJobTriggerAsync(Guid triggerId);

        /// <summary>
        /// Check if job is in progress
        /// </summary>
        /// <param name="jobId">Job id</param>
        /// <returns></returns>
        Task<bool> IsJobInProgressAsync(Guid jobId);

        /// <summary>
        /// Check if job is in progress
        /// </summary>
        /// <typeparam name="TJob">Job type</typeparam>
        /// <returns></returns>
        Task<bool> IsJobInProgressAsync<TJob>() where TJob : ScheduledJobBase;
    }
}
