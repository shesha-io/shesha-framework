using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.Reflection;
using Castle.Core.Logging;
using Hangfire;
using Hangfire.Storage;
using log4net;
using log4net.Appender;
using log4net.Layout;
using log4net.Repository.Hierarchy;
using Microsoft.AspNetCore.SignalR;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Scheduler.Attributes;
using Shesha.Scheduler.Domain;
using Shesha.Scheduler.Domain.Enums;
using Shesha.Scheduler.Exceptions;
using Shesha.Scheduler.Logging;
using Shesha.Scheduler.Services.ScheduledJobs;
using Shesha.Scheduler.SignalR;
using Shesha.Scheduler.Utilities;
using System;
using System.Linq;
using System.Reflection;
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

        public Castle.Core.Logging.ILogger Logger { get; set; }

        public ScheduledJobManager(IRepository<ScheduledJobTrigger, Guid> triggerRepository, IUnitOfWorkManager unitOfWorkManager, ITypeFinder typeFinder, IIocManager iocManager, IServiceProvider serviceProvider)
        {
            _triggerRepository = triggerRepository;
            _unitOfWorkManager = unitOfWorkManager;
            _typeFinder = typeFinder;
            _iocManager = iocManager;
            Logger = NullLogger.Instance;
            _serviceProvider = serviceProvider;
        }

        private const string JobExecutionIdKey = "JobExecutionId";

        private IHubContext<SignalrAppenderHub> _signalrHub;
        internal IHubContext<SignalrAppenderHub> SignalrHub => _signalrHub ??= _iocManager?.Resolve<IHubContext<SignalrAppenderHub>>();

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
        public async Task RunJobAsync(Guid jobId, Guid executionId, Int64? startedById, CancellationToken cancellationToken) 
        {
            var job = GetJobInstanceById(jobId);

            ConfigureLogger(job.Name, out var logger, out var log);

            job.Log = new ScheduledJobLogger(log, null);

            // Note: `executionId` is unique on the first run only, scheduler may retry the run with the same `executionId`
            // in this case we need to link new run to the initial one and generate new `executionId`
            var id = await job.AddStartExecutionRecordAsync(executionId, startedById);

            SaveJobExecutionIdForLogging(id);

            AddInstanceAppenders(job, logger);

            try
            {
                if (!Start(job.Name))
                {
                    log.WarnFormat("Try to start job {0}. Job is still busy - exit", job.Name);
                    return;
                }

                log.InfoFormat("Job {0} started...", job.Name);
                try
                {
                    await job.ExecuteAsync(executionId, startedById, cancellationToken);
                }
                finally
                {
                    Finish(job.Name);
                }

                log.InfoFormat("Job {0} run finished.", job.Name);
            }
            catch (Exception e)
            {
                job.FailExecutionInfo(e);
                throw;
            }
            finally
            {
                job.SuccessExecutionInfo();

                RemoveInstanceAppenders(job, logger);
            }
        }

        [ForwardDisableConcurrentExecution]
        public async Task RunJobAsync(Guid jobId, string jobType, Guid executionId, Int64? startedById, CancellationToken cancellationToken)
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

        private void ConfigureLogger(string name, out Logger logger, out ILog log)
        {
            //Get the logger repository hierarchy.  
            var repository = LogManager.GetRepository(Assembly.GetCallingAssembly()) as Hierarchy;

            if (repository == null)
                throw new Exception("log4net repository was not configured");

            repository.Root.Level = log4net.Core.Level.Info;

            logger = repository.GetCurrentLoggers().FirstOrDefault(l => l.Name == name) as Logger;
            if (logger == null)
            {
                // Configure default logger for scheduled job
                logger = repository.LoggerFactory.CreateLogger(repository, name);
                logger.Additivity = false;
                logger.Hierarchy = repository;
                logger.Parent = repository.Root;
                logger.Level = log4net.Core.Level.All;

                var signalRAppender = AddSignalRAppender(name, logger);
                (repository.GetLogger(name) as Logger)?.AddAppender(signalRAppender);


                // Mark repository as configured and notify that is has changed.  
                repository.Configured = true;
                repository.RaiseConfigurationChanged(EventArgs.Empty);
            }

            log = LogManager.GetLogger(Assembly.GetCallingAssembly(), name);
        }

        protected SignalrAppender AddSignalRAppender(string groupName, Logger logger)
        {
            var signalrAppender = new SignalrAppender(SignalrHub, groupName)
            {
                Name = "SignalrAppender_" + groupName,
                Threshold = log4net.Core.Level.All
            };

            var signalrLayout = new PatternLayout
            {
                ConversionPattern = "%d - %m%n%n"
            };

            signalrLayout.ActivateOptions();
            signalrAppender.Layout = signalrLayout;

            signalrAppender.ActivateOptions();

            logger.AddAppender(signalrAppender);

            return signalrAppender;
        }

        private void Finish(string name)
        {
            SignalrHub.Clients.Group(name).SendAsync("JobFinished");
        }

        private bool Start(string name)
        {
            SignalrHub.Clients.Group(name).SendAsync("JobStarted");
            return true;
        }

        private void SaveJobExecutionIdForLogging(Guid JobExecutionId)
        {
            ThreadContext.Properties[JobExecutionIdKey] = JobExecutionId != Guid.Empty
                ? JobExecutionId.ToString()
                : null;
        }

        private void AddInstanceAppenders(ScheduledJobBase job, Logger logger)
        {
            //Get the logger repository hierarchy.  
            var repository = LogManager.GetRepository(Assembly.GetCallingAssembly()) as Hierarchy;
            if (repository == null)
                throw new Exception("log4net repository was not configured");

            #region Configure signalRAppender

            var instanceSignalRAppender = AddSignalRAppender(job.JobExecutionId.ToString(), logger);

            #endregion

            #region Configure file appender

            FileAppender fileAppender = null;

            if (!string.IsNullOrWhiteSpace(job.LogFilePath))
            {
                fileAppender = new FileAppender
                {
                    Name = job.Name + "FileAppender_" + job.JobExecutionId,
                    File = job.LogFilePath,
                    AppendToFile = false,
                    Threshold = log4net.Core.Level.All,
                    LockingModel = new FileAppender.MinimalLock(),
                    ImmediateFlush = true
                };

                var jsonLayout = new JsonLayout();
                jsonLayout.ActivateOptions();
                fileAppender.Layout = jsonLayout;

                fileAppender.ActivateOptions();

                logger.AddAppender(fileAppender);
            }

            #endregion


            #region Configure Custom Appender
            //ScheduledJobEventSourceAppender.OnLog += job.OnLog;
            var scheduledJobAppender = new ScheduledJobEventSourceAppender()
            {
                Name = job.Name + "ScheduledJobEventSourceAppender_" + job.JobExecutionId,
                Threshold = log4net.Core.Level.All,
            };

            var scheduledJobLayout = new JsonLayout();
            scheduledJobLayout.ActivateOptions();

            scheduledJobAppender.Layout = scheduledJobLayout;

            scheduledJobAppender.ActivateOptions();
            logger.AddAppender(scheduledJobAppender);
            #endregion

            if (repository.GetLogger(job.Name) is Logger log)
            {
                log.AddAppender(instanceSignalRAppender);
                log.AddAppender(scheduledJobAppender);
                if (fileAppender != null)
                    log.AddAppender(fileAppender);
            }

            // Mark repository as configured and notify that is has changed.  
            repository.Configured = true;
            repository.RaiseConfigurationChanged(EventArgs.Empty);
        }

        private void RemoveInstanceAppenders(ScheduledJobBase job, Logger logger)
        {
            var appenders =
                logger.Appenders.ToArray()
                    .Where(a => a.Name.EndsWith(job.JobExecutionId.ToString(), StringComparison.InvariantCultureIgnoreCase));
            foreach (var appender in appenders)
            {
                appender.Close();
                logger.RemoveAppender(appender);
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
