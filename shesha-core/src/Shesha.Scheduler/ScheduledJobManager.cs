using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.Reflection;
using Castle.Core.Logging;
using Hangfire;
using Hangfire.Storage;
using NHibernate.Linq;
using Shesha.Reflection;
using Shesha.Scheduler.Attributes;
using Shesha.Scheduler.Domain;
using Shesha.Scheduler.Domain.Enums;
using Shesha.Scheduler.Exceptions;
using Shesha.Scheduler.Services.ScheduledJobs;
using Shesha.Scheduler.Utilities;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Scheduler
{
    /// inheritedDoc
    public class ScheduledJobManager: IScheduledJobManager, ITransientDependency
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
        private readonly IServiceProvider _serviceProvider;

        public ILogger Logger { get; set; }

        public ScheduledJobManager(IRepository<ScheduledJobTrigger, Guid> triggerRepository, IUnitOfWorkManager unitOfWorkManager, ITypeFinder typeFinder, IIocManager iocManager, IServiceProvider serviceProvider)
        {
            _triggerRepository = triggerRepository;
            _unitOfWorkManager = unitOfWorkManager;
            _typeFinder = typeFinder;
            _iocManager = iocManager;
            Logger = NullLogger.Instance;
            _serviceProvider = serviceProvider;
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
                var allRecurringJobs = JobStorage.Current.GetConnection().GetRecurringJobs();
                var jobsToRemove = allRecurringJobs.Where(j => activeTriggers.All(t => t.Id.ToString() != j.Id)).ToList();

                foreach (var jobDto in jobsToRemove)
                {
                    RecurringJob.RemoveIfExists(jobDto.Id);
                }

                // update existing triggers
                foreach (var trigger in activeTriggers)
                {
                    if (!CronStringHelper.IsValidCronExpression(trigger.CronString))
                    {
                        Logger.Warn($"Trigger {trigger.Id} has has invalid CRON expression: {trigger.CronString} - skipped");
                        continue;
                    }

                    RecurringJob.AddOrUpdate<ScheduledJobAppService>(trigger.Id.ToString(), s => s.RunTriggerAsync(trigger.Id, CancellationToken.None, trigger.Job.JobName), trigger.CronString);
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

        /// inheritedDoc
        [ForwardDisableConcurrentExecution]
        public async Task RunJobAsync(Guid jobId, Guid executionId, Int64? startedById, CancellationToken cancellationToken, string jobName) 
        {
            var job = GetJobInstanceById(jobId);
            await job.ExecuteAsync(executionId, startedById, cancellationToken);
        }

        [ForwardDisableConcurrentExecution]
        public async Task RunJobAsync(Guid jobId, string jobType, Guid executionId, Int64? startedById, CancellationToken cancellationToken, string jobName)
        {
            await ExecuteJobMethodAsync(jobId, jobType, "ExecuteAsync", new object[] { executionId, startedById, cancellationToken });
        }

        public async Task ExecuteJobMethodAsync(Guid jobId, string jobType, string methodName, object[] methodArgs)
        {
            var recordedType = !string.IsNullOrEmpty(jobType) ? Type.GetType(jobType) : GetJobTypeById(jobId).BaseType;

            if (recordedType != null)
            {
                var jobInstanceType = GetJobTypeById(jobId);
                var jobInstance = _serviceProvider.GetService(jobInstanceType);
                var methodInfo = recordedType.GetMethod(methodName);

                Task task = (Task)methodInfo.Invoke(jobInstance, methodArgs);
                await task;
            }
            
        }

        /// inheritedDoc
        public Type GetJobTypeById(Guid id)
        {
            return _typeFinder.Find(t => t.GetAttribute<ScheduledJobAttribute>()?.Uid == id).FirstOrDefault();
        }

        /// inheritedDoc
        public ScheduledJobBase GetJobInstanceById(Guid id)
        {
            var jobType = GetJobTypeById(id);
            if (jobType == null)
                throw new Exception($"Job with Id = '{id}' not found");

            var jobInstance = _iocManager.Resolve(jobType) as ScheduledJobBase;
            return jobInstance;
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
    }
}
