using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Hangfire;
using Microsoft.AspNetCore.Mvc;
using Shesha.DynamicEntities.Dtos;
using Shesha.Scheduler.Attributes;
using Shesha.Scheduler.Bootstrappers;
using Shesha.Scheduler.Domain;
using Shesha.Scheduler.Services.ScheduledJobs.Dto;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Scheduler.Services.ScheduledJobs
{
    /// <summary>
    /// Scheduled Job application service
    /// </summary>
    public class ScheduledJobAppService : DynamicCrudAppService<ScheduledJob, DynamicDto<ScheduledJob, Guid>, Guid>, ITransientDependency
    {
        private readonly IScheduledJobManager _jobManager;
        private readonly IRepository<ScheduledJob, Guid> _jobRepo;

        /// <summary>
        /// Default constructor
        /// </summary>
        public ScheduledJobAppService(IRepository<ScheduledJob, Guid> repository, IScheduledJobManager jobManager, IRepository<ScheduledJob, Guid> jobRepo) : base(repository)
        {
            _jobManager = jobManager;
            _jobRepo = jobRepo;
        }

        /// <summary>
        /// Run scheduled job
        /// </summary>
        [HttpPost]
        public async Task<StartJobResponse> StartJobAsync(StartJobInput input, CancellationToken cancellationToken)
        {
            var id = input.JobId;

            // note: special code fore manual jobs
            var scheduledJob = await _jobRepo.FirstOrDefaultAsync(j => j.Id == id);

            if (scheduledJob == null)
                throw new Exception("Job with the specified Id not found");

            var job = _jobManager.GetJobInstanceById(id);

            var executionId = Guid.NewGuid();

            BackgroundJob.Enqueue<IScheduledJobManager>(manager => manager.RunJobAsync(id, executionId, AbpSession.UserId, cancellationToken));

            return new StartJobResponse(executionId);
        }

        /// <summary>
        /// Enqueue all jobs using Hangfire
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public async Task EnqueueAllAsync()
        {
            await _jobManager.EnqueueAllAsync();
        }

        /// <summary>
        /// Run scheduled job trigger
        /// </summary>
        /// <param name="triggerId">Trigger Id</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <param name="jobName"></param>
        /// <returns></returns>
        [ForwardDisableConcurrentExecution]
        [JobDisplayName("{2}")]
        public async Task RunTriggerAsync(Guid triggerId, CancellationToken cancellationToken, string jobName)
        {
            var triggerService = IocManager.Resolve<IRepository<ScheduledJobTrigger, Guid>>();
            Guid jobId;
            string? jobType = null;

            using (var uow = UnitOfWorkManager.Begin())
            {
                // switch off the `SoftDelete` filter to skip job execution by a normal way and prevent unneeded retries
                using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
                {
                    var trigger = await triggerService.GetAsync(triggerId);
                    if (trigger.IsDeleted)
                    {
                        Logger.Warn($"Trigger with Id = '{triggerId}' is deleted, execution skipped");
                        return;
                    }

                    if (trigger.Job.IsDeleted)
                    {
                        Logger.Warn($"Job with Id = '{triggerId}' is deleted, execution of trigger '{triggerId}' skipped");
                        return;
                    }

                    jobId = trigger.Job.Id;
                    jobType = trigger.Job.JobType;
                }

                await uow.CompleteAsync();
            }

            var executionId = Guid.NewGuid();

            var job = _jobManager.GetJobInstanceById(jobId);
            job.TriggerId = triggerId;
            await job.AddStartExecutionRecordAsync(executionId, AbpSession.UserId);
            await job.ExecuteAsync(executionId, AbpSession.UserId, cancellationToken);
        }

        /// <summary>
        /// Bootstraps all scheduled jobs and default CRON triggers
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public async Task<string> BootstrapScheduledJobsAsync(bool force)
        {
            var bootstrapper = IocManager.Resolve<ScheduledJobBootstrapper>();
            await bootstrapper.ProcessAsync(force);
            return "Bootstrapped successfully";
        }
    }
}
