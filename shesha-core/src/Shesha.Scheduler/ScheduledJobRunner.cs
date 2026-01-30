using Abp;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Reflection;
using Abp.Runtime.Session;
using Hangfire.Server;
using log4net;
using log4net.Appender;
using log4net.Layout;
using log4net.Repository.Hierarchy;
using Microsoft.AspNetCore.SignalR;
using Shesha.Reflection;
using Shesha.Scheduler.Attributes;
using Shesha.Scheduler.Domain;
using Shesha.Scheduler.Extensions;
using Shesha.Scheduler.Logging;
using Shesha.Scheduler.SignalR;
using System;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Scheduler
{
    internal class ScheduledJobRunner : AbpServiceBase, IScheduledJobRunner, ITransientDependency
    {
        private readonly IIocResolver _iocResolver;
        private readonly IRepository<ScheduledJobTrigger, Guid> _triggerRepository;
        private readonly ITypeFinder _typeFinder;

        /// <summary>
        /// Gets current session information.
        /// </summary>
        public IAbpSession AbpSession { get; set; } = NullAbpSession.Instance;

        public ScheduledJobRunner(IIocResolver iocManager,
            ITypeFinder typeFinder,
            IRepository<ScheduledJobTrigger, Guid> triggerRepository)
        {
            _iocResolver = iocManager;
            _typeFinder = typeFinder;
            _triggerRepository = triggerRepository;
        }

        private IHubContext<SignalrAppenderHub> _signalrHub;
        internal IHubContext<SignalrAppenderHub> SignalrHub => _signalrHub ??= _iocResolver.Resolve<IHubContext<SignalrAppenderHub>>();

        [ForwardDisableConcurrentExecution]
        public async Task RunTriggerAsync(string jobName, Guid triggerId, CancellationToken cancellationToken, PerformContext? context = null)
        {
            Guid jobId;
            string? jobType = null;

            using (var uow = UnitOfWorkManager.Begin())
            {
                // switch off the `SoftDelete` filter to skip job execution by a normal way and prevent unneeded retries
                using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
                {
                    var trigger = await _triggerRepository.GetAsync(triggerId);
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

            // save jobId and executionId for monitoring purposes
            context?.SetJobId(jobId);
            context?.SetExecutionId(executionId);

            var job = GetJobInstanceById(jobId);
            job.TriggerId = triggerId;
            await job.CreateExecutionRecordAsync(executionId, AbpSession.UserId);

            await job.ExecuteAsync(executionId, AbpSession.UserId, cancellationToken, context);
        }

        const string defaultPattern = "%-5level %utcdate %message%newline";

        private void ConfigureLogger(string name, out Logger logger, out log4net.ILog log)
        {
            //Get the logger repository hierarchy.  
            var repository = LogManager.GetRepository(Assembly.GetCallingAssembly()) as Hierarchy;

            if (repository == null)
                throw new Exception("log4net repository was not configured");

            repository.Root.Level = log4net.Core.Level.Info;

            var existingLogger = repository.GetCurrentLoggers().FirstOrDefault(l => l.Name == name) as Logger;
            if (existingLogger == null)
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
            } else
                logger = existingLogger;

                log = LogManager.GetLogger(Assembly.GetCallingAssembly(), name);
        }

        private SignalrAppender AddSignalRAppender(string groupName, Logger logger)
        {
            var signalrAppender = new SignalrAppender(SignalrHub, groupName)
            {
                Name = "SignalrAppender_" + groupName,
                Threshold = log4net.Core.Level.All
            };

            var signalrLayout = new PatternLayout(defaultPattern);

            signalrLayout.ActivateOptions();
            signalrAppender.Layout = signalrLayout;

            signalrAppender.ActivateOptions();

            logger.AddAppender(signalrAppender);

            return signalrAppender;
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

            FileAppender? fileAppender = null;

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

                var fileLayout = new PatternLayout(defaultPattern);
                fileLayout.ActivateOptions();
                fileAppender.Layout = fileLayout;

                fileAppender.ActivateOptions();

                logger.AddAppender(fileAppender);
            }

            #endregion


            #region Configure Custom Appender

            var scheduledJobAppender = new ScheduledJobEventSourceAppender()
            {
                Name = job.Name + "ScheduledJobEventSourceAppender_" + job.JobExecutionId,
                Threshold = log4net.Core.Level.All,
            };

            var scheduledJobLayout = new PatternLayout(defaultPattern);
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

        private async Task NotifyClientsJobFinishedAsync(string name)
        {
            await SignalrHub.Clients.Group(name).SendAsync("JobFinished");
        }

        private async Task NotifyClientsJobFailedAsync(string name, Exception e)
        {
            await SignalrHub.Clients.Group(name).SendAsync("JobFailed", new { ErrorMessage = e.Message });
        }

        private async Task NotifyClientsJobCancelledAsync(string name, Exception e)
        {
            await SignalrHub.Clients.Group(name).SendAsync("JobCancelled", new { ErrorMessage = e.Message });
        }

        private async Task NotifyClientsJobStartedAsync(string name)
        {
            await SignalrHub.Clients.Group(name).SendAsync("JobStarted");
        }

        private const string JobExecutionIdKey = "JobExecutionId";

        private void SaveJobExecutionIdForLogging(Guid JobExecutionId)
        {
            ThreadContext.Properties[JobExecutionIdKey] = JobExecutionId != Guid.Empty
                ? JobExecutionId.ToString()
                : null;
        }

        /// inheritedDoc
        public Type? GetJobTypeByIdOrNull(Guid id)
        {
            return _typeFinder.Find(t => t.GetAttributeOrNull<ScheduledJobAttribute>()?.Uid == id).FirstOrDefault();
        }

        // inheritedDoc
        public Type GetJobTypeById(Guid id)
        {
            return GetJobTypeByIdOrNull(id) ?? throw new Exception($"Type of job with id = '{id}' is unavailable");
        }

        /// inheritedDoc
        public ScheduledJobBase GetJobInstanceById(Guid id)
        {
            var jobType = GetJobTypeById(id);
            var jobInstance = _iocResolver.Resolve(jobType).ForceCastAs<ScheduledJobBase>();
            return jobInstance;
        }

        public async Task PreCreateExecutionRecordAsync(Guid executionId, Guid jobId, Guid? triggerId, Int64? startedById)
        {
            var job = GetJobInstanceById(jobId);
            await job.CreateExecutionRecordAsync(executionId, startedById);
        }

        /// inheritedDoc
        [ForwardDisableConcurrentExecution]
        public async Task RunJobAsync(string jobName, JobEnvelope envelope, CancellationToken cancellationToken, PerformContext? context = null)
        {
            var jobId = envelope.JobId;
            var startedById = envelope.StartedById;
            var executionId = envelope.ExecutionId ?? Guid.NewGuid();

            // save jobId and executionId for monitoring purposes
            context?.SetJobId(jobId);
            context?.SetExecutionId(executionId);

            var job = GetJobInstanceById(jobId);

            await job.StartExecutionAsync(executionId);

            ConfigureLogger(job.Name, out var logger, out var log);

            job.Log = new ScheduledJobLogger(log, null);

            SaveJobExecutionIdForLogging(executionId);

            AddInstanceAppenders(job, logger);

            try
            {
                await NotifyClientsJobStartedAsync(job.Name);

                log.InfoFormat("Job {0} started...", job.Name);

                if (!string.IsNullOrWhiteSpace(envelope.ParametersJson)) 
                {
                    if (job is IParametrizedJob parametrizedJob)
                        await parametrizedJob.ReadParametersJsonAsync(envelope.ParametersJson);
                }                    

                await job.ExecuteAsync(executionId, startedById, cancellationToken, context);

                await job.MarkExecutionAsSuccessAsync();

                log.InfoFormat("Job {0} run finished.", job.Name);
                await NotifyClientsJobFinishedAsync(job.Name);
            }
            catch (Exception e)
            {
                var isCancelled = e is OperationCanceledException ||
                    e.InnerException != null &&
                    e.InnerException is OperationCanceledException;

                if (!isCancelled)
                {
                    log.Error($"Error occurred during {job.Name} run: {e.Message}", e);
                    await NotifyClientsJobFailedAsync(job.Name, e);

                    await job.MarkExecutionAsFailureAsync(e);
                    throw;
                }
                else
                {
                    log.Error($"Job {job.Name} interrupted");
                    await NotifyClientsJobCancelledAsync(job.Name, e);

                    await job.MarkExecutionAsCancelledAsync(e);
                }
            }
            finally
            {
                RemoveInstanceAppenders(job, logger);
            }

        }
    }
}
