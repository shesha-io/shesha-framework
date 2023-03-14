using Abp.Application.Services.Dto;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Hangfire;
using Microsoft.AspNetCore.Mvc;
using NHibernate.Linq;
using Shesha.Authorization.Users;
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
    public class ScheduledJobAppService : SheshaCrudServiceBase<ScheduledJob, ScheduledJobDto, Guid>, ITransientDependency
    {
        private readonly IScheduledJobManager _jobManager;
        private readonly IRepository<ScheduledJob, Guid> _jobRepo;
        private readonly IServiceProvider _serviceProvider;

        public IRepository<User, Int64> UserRepository { get; set; }

        /// <summary>
        /// Default constructor
        /// </summary>
        public ScheduledJobAppService(IRepository<ScheduledJob, Guid> repository, IScheduledJobManager jobManager, IRepository<ScheduledJob, Guid> jobRepo, IServiceProvider provider) : base(repository)
        {
            _jobManager = jobManager;
            _jobRepo = jobRepo;
            _serviceProvider = provider;
        }

        /// <summary>
        /// Run scheduled job
        /// </summary>
        /// <param name="id">Scheduled job Id</param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<Guid> StartJobAsync(Guid id, CancellationToken cancellationToken)
        {
            // note: special code fore manual jobs
            var scheduledJob = await _jobRepo.GetAll().FirstOrDefaultAsync(j => j.Id == id, cancellationToken: cancellationToken);

            if (scheduledJob == null)
                throw new Exception("Job with the specified Id not found");

            var job = _jobManager.GetJobInstanceById(id);

            var executionId = Guid.NewGuid();

            if (job == null)
            {
                var action = (ScheduledJobExecution ex) =>
                {
                    ex.Status = Domain.Enums.ExecutionStatus.Enqueued;
                    ex.StartedBy = AbpSession.UserId.HasValue
                    ? UserRepository.Get(AbpSession.UserId.Value)
                    : null;
                };

                await _jobManager.ExecuteJobMethodAsync(id, scheduledJob.JobType, "CreateExecutionRecordAsync", new object[] { executionId, action });

                BackgroundJob.Enqueue<IScheduledJobManager>(manager => manager.RunJobAsync(id, scheduledJob.JobType, executionId, AbpSession.UserId, cancellationToken, scheduledJob.JobName));

            }
            else
            {
                await job.CreateExecutionRecordAsync(executionId,
                    execution =>
                    {
                        execution.Status = Domain.Enums.ExecutionStatus.Enqueued;
                        execution.StartedBy = AbpSession.UserId.HasValue
                            ? UserRepository.Get(AbpSession.UserId.Value)
                            : null;
                    }
                );
                BackgroundJob.Enqueue<IScheduledJobManager>(manager => manager.RunJobAsync(id, executionId, AbpSession.UserId, cancellationToken, scheduledJob.JobName));
            }

            return executionId;
        }

        /// <summary>
        /// Enqueue all jobs using Hangfire
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public async Task EnqueueAll()
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
            string jobType = null;

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

            var job = _jobManager.GetJobInstanceById(jobId);
            
            if (job == null)
            {
                await _jobManager.ExecuteJobMethodAsync(jobId, jobType, "ExecuteAsync", new object[] { Guid.NewGuid(), AbpSession.UserId, cancellationToken });
            }
            else
            {
                job.TriggerId = triggerId;

                await job.ExecuteAsync(Guid.NewGuid(), AbpSession.UserId, cancellationToken);
            }
        }

        /// <summary>
        /// Bootstraps all scheduled jobs and default CRON triggers
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public async Task<string> BootstrapScheduledJobs()
        {
            var bootstrapper = IocManager.Resolve<ScheduledJobBootstrapper>();
            await bootstrapper.ProcessAsync();
            return "Bootstrapped successfully";
        }

        /// inheritedDoc
        public override async Task<ScheduledJobDto> CreateAsync(ScheduledJobDto input)
        {
            var result = await base.CreateAsync(input);

            await UnitOfWorkManager.Current.SaveChangesAsync();

            // sync with Hangfire
            await _jobManager.EnqueueAllAsync();

            return result;
        }

        /// inheritedDoc
        public override async Task<ScheduledJobDto> UpdateAsync(ScheduledJobDto input)
        {
            var result = await base.UpdateAsync(input);

            await UnitOfWorkManager.Current.SaveChangesAsync();

            // sync with Hangfire
            await _jobManager.EnqueueAllAsync();

            return result;
        }

        /// inheritedDoc
        public override async Task DeleteAsync(EntityDto<Guid> input)
        {
            await base.DeleteAsync(input);

            await UnitOfWorkManager.Current.SaveChangesAsync();

            // sync with Hangfire
            await _jobManager.EnqueueAllAsync();
        }
    }
}
