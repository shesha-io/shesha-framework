using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.Reflection;
using Castle.Core.Logging;
using Hangfire;
using Hangfire.Storage;
using Newtonsoft.Json;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Scheduler.Attributes;
using Shesha.Scheduler.Domain;
using Shesha.Scheduler.Domain.Enums;
using Shesha.Scheduler.Exceptions;
using Shesha.Scheduler.Extensions;
using Shesha.Scheduler.Utilities;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Scheduler
{
    /// inheritedDoc
    public class ScheduledJobManager : IScheduledJobManager, ITransientDependency
        , IAsyncEventHandler<EntityCreatedEventData<ScheduledJob>>
        , IAsyncEventHandler<EntityDeletedEventData<ScheduledJob>>
        , IAsyncEventHandler<EntityUpdatedEventData<ScheduledJob>>
        
        , IAsyncEventHandler<EntityCreatedEventData<ScheduledJobTrigger>>
        , IAsyncEventHandler<EntityDeletedEventData<ScheduledJobTrigger>>
        , IAsyncEventHandler<EntityUpdatedEventData<ScheduledJobTrigger>>
    {
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IRepository<ScheduledJobTrigger, Guid> _triggerRepository;
        private readonly ITypeFinder _typeFinder;
        private readonly IIocManager _iocManager;
        private readonly IScheduledJobRunner _jobRunner;

        public ILogger Logger { get; set; }

        public ScheduledJobManager(
            IRepository<ScheduledJobTrigger, Guid> triggerRepository,
            IUnitOfWorkManager unitOfWorkManager, 
            ITypeFinder typeFinder, 
            IIocManager iocManager,
            IScheduledJobRunner jobRunner)
        {
            _triggerRepository = triggerRepository;
            _unitOfWorkManager = unitOfWorkManager;
            _typeFinder = typeFinder;
            _iocManager = iocManager;
            _jobRunner = jobRunner;
            Logger = NullLogger.Instance;
        }

        /// inheritedDoc
        public async Task EnqueueAllAsync()
        {
            try
            {
                var activeTriggers = await _triggerRepository.GetAll()
                    .Where(t => !t.Job.IsDeleted && t.Job.JobStatus == JobStatus.Active && t.Job.StartupMode == StartUpMode.Automatic && t.Status == TriggerStatus.Enabled)
                    .ToListAsync();

                // remove all unused triggers
                using (var storageConnection = JobStorage.Current.GetConnection()) 
                {
                    var allRecurringJobs = storageConnection.GetRecurringJobs();
                    var jobsToRemove = allRecurringJobs.Where(j => activeTriggers.All(t => t.Id.ToString() != j.Id)).ToList();

                    foreach (var jobDto in jobsToRemove)
                    {
                        RecurringJob.RemoveIfExists(jobDto.Id);
                    }
                }                

                // update existing triggers
                foreach (var trigger in activeTriggers)
                {
                    if (!CronStringHelper.IsValidCronExpression(trigger.CronString))
                    {
                        Logger.Warn($"Trigger {trigger.Id} has has invalid CRON expression: {trigger.CronString} - skipped");
                        continue;
                    }

                    RecurringJob.AddOrUpdate<IScheduledJobRunner>(trigger.Id.ToString(), runner => runner.RunTriggerAsync(trigger.Job.JobName, trigger.Id, CancellationToken.None, null), trigger.CronString);
                }
            }
            catch (Exception)
            {
                throw;
            }
        }

        public Type GetJobType(Guid triggerId)
        {
            Guid? jobId = null;

            using (var uow = _unitOfWorkManager.Begin())
            {
                // switch off the `SoftDelete` filter to skip job execution by a normal way and prevent unneeded retries
                using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
                {
                    var trigger = _triggerRepository.Get(triggerId);
                    if (trigger.IsDeleted)
                        throw new TriggerDeletedException(triggerId);

                    if (trigger.Job.IsDeleted)
                        throw new JobDeletedException(trigger.Job.Id, trigger.Id);

                    jobId = trigger.Job.Id;
                }

                uow.Complete();
            }

            var jobType = _typeFinder.Find(t => t.GetAttribute<ScheduledJobAttribute>()?.Uid == jobId).FirstOrDefault();
            if (jobType == null)
                throw new Exception($"Job with Id = '{jobId}' not found");

            return jobType;
        }

        public async Task EnqeueJobTriggerAsync(Guid triggerId)
        {
            var trigger = await _triggerRepository.GetAsync(triggerId);

            BackgroundJob.Enqueue<IScheduledJobRunner>(runner => runner.RunTriggerAsync(trigger.Job.JobName, triggerId, CancellationToken.None, null));
        }

        private async Task SyncWithJobManagerAsync() 
        {
            using (var uow = _unitOfWorkManager.Begin())
            {
                // sync with Hangfire
                await EnqueueAllAsync();

                await uow.CompleteAsync();
            }
        }

        #region events
        public async Task HandleEventAsync(EntityCreatedEventData<ScheduledJob> eventData)
        {
            await SyncWithJobManagerAsync();
        }

        [UnitOfWork]
        public async Task HandleEventAsync(EntityDeletedEventData<ScheduledJob> eventData)
        {
            await SyncWithJobManagerAsync();
        }

        [UnitOfWork]
        public async Task HandleEventAsync(EntityUpdatedEventData<ScheduledJob> eventData)
        {
            await SyncWithJobManagerAsync();
        }

        public async Task HandleEventAsync(EntityCreatedEventData<ScheduledJobTrigger> eventData)
        {
            await SyncWithJobManagerAsync();
        }

        public async Task HandleEventAsync(EntityDeletedEventData<ScheduledJobTrigger> eventData)
        {
            await SyncWithJobManagerAsync();
        }

        public async Task HandleEventAsync(EntityUpdatedEventData<ScheduledJobTrigger> eventData)
        {
            await SyncWithJobManagerAsync();
        }

        #endregion

        public Task<bool> IsJobInProgressAsync(Guid jobId)
        {
            var monitoringApi = JobStorage.Current.GetMonitoringApi();
            var processingJobs = monitoringApi.ProcessingJobs(0, int.MaxValue);

            if (!processingJobs.Any())
                return Task.FromResult(false);

            using (var connection = JobStorage.Current.GetConnection())
            {
                var inProgress = processingJobs.Any(j => {
                    var jobData = connection.GetJobData(j.Key);
                    var extractedJobId = jobData.GetJobId();

                    return extractedJobId != null && extractedJobId == jobId;
                });

                return Task.FromResult(inProgress);
            }
        }

        public Task<bool> IsJobInProgressAsync<TJob>() where TJob : ScheduledJobBase
        {
            var jobId = GetJobId<TJob>();
            return IsJobInProgressAsync(jobId);
        }

        public Guid GetJobId<TJob>() where TJob : ScheduledJobBase
        {
            var attribute = typeof(TJob).GetAttribute<ScheduledJobAttribute>();
            return attribute.Uid;
        }

        public async Task EnqeueJobAsync(Guid jobId, Guid executionId, long? startedById)
        {
            var jobType = _jobRunner.GetJobTypeById(jobId);
            await _jobRunner.PreCreateExecutionRecordAsync(executionId, jobId, null, startedById);

            var envelope = new JobEnvelope(jobId)
            {
                ExecutionId = executionId,
                StartedById = startedById,
            };

            BackgroundJob.Enqueue<IScheduledJobRunner>(runner => runner.RunJobAsync(jobType.Name, envelope, CancellationToken.None, null));
        }

        public async Task EnqeueJobAsync<TJob>(Guid executionId, long? startedById) where TJob : ScheduledJobBase
        {
            var jobId = GetJobId<TJob>();

            await EnqeueJobAsync(jobId, executionId, startedById);
        }

        public async Task EnqeueJobAsync<TJob, TParams>(Guid executionId, long? startedById, TParams jobParams)
            where TJob : ScheduledJobBase, IParametrizedJob<TParams>
            where TParams : class, new()
        {
            var jobId = GetJobId<TJob>();
            var jobType = typeof(TJob);

            await _jobRunner.PreCreateExecutionRecordAsync(executionId, jobId, null, startedById);

            var parametersJson = JsonConvert.SerializeObject(jobParams);
            var envelope = new JobEnvelope(jobId) { 
                ExecutionId = executionId,
                StartedById = startedById,
                ParametersJson = parametersJson,
            };

            BackgroundJob.Enqueue<IScheduledJobRunner>(runner => runner.RunJobAsync(jobType.Name, envelope, CancellationToken.None, null));
        }
    }
}
