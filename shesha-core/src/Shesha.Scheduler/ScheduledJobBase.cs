using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Extensions;
using log4net;
using log4net.Appender;
using log4net.Core;
using log4net.Layout;
using log4net.Repository.Hierarchy;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using NHibernate.Linq;
using Shesha.Authorization.Users;
using Shesha.Domain;
using Shesha.Exceptions;
using Shesha.Reflection;
using Shesha.Scheduler.Attributes;
using Shesha.Scheduler.Domain;
using Shesha.Scheduler.Domain.Enums;
using Shesha.Scheduler.Logging;
using Shesha.Scheduler.SignalR;
using Shesha.Services;
using Shesha.Utilities;
using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using System.Transactions;
using ILogger = Castle.Core.Logging.ILogger;

namespace Shesha.Scheduler
{
    /// <summary>
    /// Scheduled job base class
    /// </summary>
    public abstract class ScheduledJobBase<T> where T : ScheduledJobStatistic, new()
    {
        private IHubContext<SignalrAppenderHub> _signalrHub;

        public IRepository<User, Int64> UserRepository { get; set; }

        internal IHubContext<SignalrAppenderHub> SignalrHub => _signalrHub ??= IocManager?.Resolve<IHubContext<SignalrAppenderHub>>();

        private IStoredFileService _storedFileService => IocManager?.Resolve<IStoredFileService>();

        private const string JobExecutionIdKey = "JobExecutionId";

        public string Name => GetType().StripCastleProxyType().Name;
        public string TriggerName => $"{Name}_Trigger";

        public virtual T JobStatistics { get; private set; }

        /// <summary>
        /// Type of the parameters class
        /// </summary>
        public virtual Type ParametersType { get; }

        private Guid? _id;
        public Guid Id
        {
            get
            {
                if (!_id.HasValue)
                {
                    var attribute = GetType().GetAttribute<ScheduledJobAttribute>(true);
                    if (attribute == null)
                        throw new Exception($"ScheduledJobAttribute should be applied on the {GetType().Name} class");

                    _id = attribute.Uid;
                }

                return _id.Value;
            }
        }

        private LogMode _logMode
        {
            get
            {
                var attribute = GetType().GetAttribute<ScheduledJobAttribute>(true);
                if (attribute == null)
                    throw new Exception($"ScheduledJobAttribute should be applied on the {GetType().Name} class");
                return attribute.LogMode;
            }
        }

        /// <summary>
        /// IoC manager
        /// </summary>
        public IIocManager IocManager { get; set; }

        /// <summary>
        /// Path Helper
        /// </summary>
        public IPathHelper PathHelper { get; set; }

        /// <summary>
        /// Unit of work manager
        /// </summary>
        public IUnitOfWorkManager UnitOfWorkManager { get; set; }

        /// <summary>
        /// Job repository
        /// </summary>
        public IRepository<ScheduledJob, Guid> JobRepository { get; set; }

        /// <summary>
        /// Trigger repository
        /// </summary>
        public IRepository<ScheduledJobTrigger, Guid> TriggerRepository { get; set; }

        /// <summary>
        /// Job execution repository
        /// </summary>
        public IRepository<ScheduledJobExecution, Guid> JobExecutionRepository { get; set; }

        protected readonly CancellationTokenSource CancellationTokenSource;
        protected CancellationToken CancellationToken;

        protected ILog Log;
        private Logger _logger;

        /// <summary>
        /// Reference to the logger to write logs.
        /// </summary>
        protected ILogger Logger => _defaultLogger ??= IocManager.Resolve<ILogger>();

        /// <summary>
        /// Default logger, it used when instance logger is not set
        /// </summary>
        private ILogger _defaultLogger;

        private void SaveJobExecutionIdForLogging()
        {
            ThreadContext.Properties[JobExecutionIdKey] = JobExecutionId != Guid.Empty
                ? JobExecutionId.ToString()
                : null;
        }

        private Guid JobExecutionId { get; set; }
        private string LogFileName { get; set; }
        private string LogFilePath { get; set; }
        private string LogFolderPath
        {
            get
            {
                var config = IocManager?.Resolve<IConfiguration>();
                var logFolderPath = config.GetValue<string>("DefaultLogFolder");

                if (logFolderPath.IsNullOrEmpty() || logFolderPath.IsNullOrWhiteSpace())
                {
                    logFolderPath = "~/App_Data/logs/jobs";
                }
                
                return logFolderPath;
            }
        }

        private string LogFolderName
        {
            get
            {
                var attribute = GetType().GetAttribute<ScheduledJobAttribute>(true);
                if (attribute == null)
                    throw new Exception($"ScheduledJobAttribute should be applied on the {GetType().Name} class");

                string logFolder = (!attribute.LogFolder.IsNullOrEmpty() && !attribute.LogFolder.IsNullOrWhiteSpace()) ? attribute.LogFolder: Name;

                return logFolder;
            }
        }

        protected ScheduledJobBase()
        {
            JobStatistics = new T();
        }

        private void Finish()
        {
            SignalrHub.Clients.Group(Name).SendAsync("JobFinished");
        }

        private bool Start()
        {
            SignalrHub.Clients.Group(Name).SendAsync("JobStarted");

            return true;
        }

        public Guid? TriggerId { get; internal set; }

        /// <summary>
        /// Execute scheduled job
        /// </summary>
        /// <param name="executionId">Pre-defined Id of the job execution, is used for the progress tracking</param>
        /// <param name="startedById">Id of the user who started the job (in case it was started manually)</param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        [UnitOfWork]
        public async Task ExecuteAsync(Guid executionId, Int64? startedById, CancellationToken cancellationToken)
        {
            ConfigureLogger();

            // Note: `executionId` is unique on the first run only, scheduler may retry the run with the same `executionId`
            // in this case we need to link new run to the initial one and generate new `executionId`

            var id = await CreateExecutionRecordAsync(executionId,
                execution =>
                {
                    JobExecutionId = execution.Id;
                    LogFileName = $"{DateTime.Now:yyyy-MM-dd_HHmmss}_{JobExecutionId}.log";
                    LogFilePath = PathHelper.MapVirtualPath($"{LogFolderPath}/{LogFolderName}/{LogFileName}");

                    // save path to execution
                    execution.Status = ExecutionStatus.InProgress;
                    execution.LogFilePath = LogFilePath;
                    execution.StartedBy = startedById.HasValue
                        ? UserRepository.Get(startedById.Value)
                        : null;
                }
            );

            SaveJobExecutionIdForLogging();

            AddInstanceAppenders(LogFilePath);
            try
            {
                if (!Start())
                {
                    Log.WarnFormat("Try to start job {0}. Job is still busy - exit", Name);
                    return;
                }

                Log.InfoFormat("Job {0} started...", Name);
                try
                {
                    var task = Task.Run(async () =>
                    {
                        try
                        {
                            SaveJobExecutionIdForLogging();

                            var method = this.GetType().GetMethod(nameof(DoExecuteAsync));
                            var unitOfWorkAttribute = method.GetAttribute<UnitOfWorkAttribute>(true);

                            if (unitOfWorkAttribute != null && unitOfWorkAttribute.IsDisabled)
                            {
                                await DoExecuteAsync(cancellationToken);
                            }
                            else
                            {
                                var unitOfWork = unitOfWorkAttribute != null
                                    ? UnitOfWorkManager.Begin(new UnitOfWorkOptions
                                    {
                                        IsTransactional = unitOfWorkAttribute.IsTransactional,
                                        IsolationLevel = unitOfWorkAttribute.IsolationLevel,
                                        Timeout = unitOfWorkAttribute.Timeout,
                                        Scope = unitOfWorkAttribute.Scope
                                    })
                                    : UnitOfWorkManager.Begin();

                                using (unitOfWork)
                                {
                                    await DoExecuteAsync(cancellationToken);
                                    await unitOfWork.CompleteAsync();
                                }
                            }

                            await OnSuccess();
                        }
                        catch (Exception e)
                        {
                            if (e is OperationCanceledException ||
                                e.InnerException != null &&
                                e.InnerException is OperationCanceledException)
                                Log.ErrorFormat("Job {0} interrupted", Name);
                            else
                            {
                                Log.Error($"Error occured during {Name} run: {e.Message}", e);
                                await OnFail(e);
                            }
                        }
                    }, CancellationToken);

                    await task;
                    // restore 
                }
                finally
                {
                    Finish();
                }

                Log.InfoFormat("Job {0} run finished.", Name);
            }
            catch (Exception e)
            {
                UpdateExecutionInfo(execution =>
                {
                    execution.ErrorMessage = e.FullMessage();
                    execution.Status = ExecutionStatus.Failed;
                });
                throw;
            }
            finally
            {
                UpdateExecutionInfo(e =>
                {
                    e.FinishedOn = DateTime.Now;
                    if (e.Status == ExecutionStatus.InProgress)
                        e.Status = ExecutionStatus.Completed;

                    if (_logMode == LogMode.StoredFile)
                        e.LogFile = AsyncHelper.RunSync(() => { return CreateStoredFileLog(LogFilePath, LogFileName, LogFolderName); });

                    if (JobStatistics != null)
                        e.JobStatistics = JobStatistics;//JsonConvert.SerializeObject(JobStatistics, Formatting.Indented);
                });

                RemoveInstanceAppenders();
            }
        }

        /*
        protected Tp GetParamsOrDefault<Tp>(IJobExecutionContext context, Tp defaultValue = null) where Tp : class, new()
        {
            return GetParams<Tp>(context, false) ?? new Tp();
        }

        protected Tp GetParams<Tp>(IJobExecutionContext context, bool throwIfEmpty = true) where Tp : class
        {
            var explicitParams = context.MergedJobDataMap.Get("explicitParams") as Tp;
            if (explicitParams != null)
                return explicitParams;

            var trigger = GetTrigger(context);
            var parametersJson = trigger.GetJsonParameters() as Tp;
            if (parametersJson == null && throwIfEmpty)
                throw new Exception("Settings are empty");
            return parametersJson;
        }
        */


        public virtual async Task OnSuccess()
        {
            try
            {
                using (var uow = UnitOfWorkManager.Begin())
                {
                    var trigger = GetTrigger();
                    if (trigger == null)
                        return;

                    // todo: implement notifications

                    await uow.CompleteAsync();
                }
            }
            catch (Exception e)
            {
                Logger.Error(e.Message, e);
            }
        }

        public virtual async Task OnFail(Exception ex)
        {
            try
            {
                using (var uow = UnitOfWorkManager.Begin())
                {
                    var trigger = GetTrigger();
                    if (trigger == null)
                        return;

                    // todo: implement notifications

                    await uow.CompleteAsync();
                }
            }
            catch (Exception e)
            {
                Logger.Error(e.Message, e);
            }
        }

        public virtual void OnLog(object sender, ScheduledJobOnLogEventArgs e)
        {

        }


        protected ScheduledJobExecution GetExecutionRecord()
        {
            return JobExecutionRepository.Get(JobExecutionId);
        }

        protected ScheduledJobTrigger GetTrigger()
        {
            return TriggerId.HasValue
                ? TriggerRepository.Get(TriggerId.Value)
                : null;
        }

        protected void UpdateExecutionInfo(Action<ScheduledJobExecution> updateAction)
        {
            try
            {
                if (JobExecutionId == Guid.Empty)
                    return;

                using (var unitOfWork = UnitOfWorkManager.Begin())
                {
                    var jobExecution = JobExecutionRepository.Get(JobExecutionId);
                    updateAction.Invoke(jobExecution);
                    JobExecutionRepository.Update(jobExecution);

                    // save changes
                    unitOfWork.Complete();
                }
            }
            catch (Exception e)
            {
                // rollback
                Logger.Error(e.Message, e);
            }
        }

        /// <summary>
        /// Create execution record
        /// </summary>
        public async Task<Guid> CreateExecutionRecordAsync(Guid executionId, Action<ScheduledJobExecution> prepare)
        {
            try
            {
                if (executionId == Guid.Empty)
                    throw new Exception($"{nameof(executionId)} must not be empty");

                using (var unitOfWork = UnitOfWorkManager.Begin(TransactionScopeOption.RequiresNew))
                {
                    var existingExecution = await JobExecutionRepository.GetAll().FirstOrDefaultAsync(ex => ex.Id == executionId);
                    ScheduledJobExecution jobExecution = null;

                    if (existingExecution != null && existingExecution.Status == ExecutionStatus.Enqueued)
                    {
                        jobExecution = existingExecution;
                        jobExecution.Status = ExecutionStatus.InProgress;
                    }
                    else
                    {
                        var job = await JobRepository.GetAsync(Id);
                        var trigger = GetTrigger();
                        jobExecution = new ScheduledJobExecution()
                        {
                            Id = existingExecution != null
                                ? Guid.NewGuid()
                                : executionId,
                            Job = job,
                            StartedOn = DateTime.Now,
                            Status = ExecutionStatus.Enqueued,
                            Trigger = trigger,
                            ParentExecution = existingExecution
                        };
                    }

                    prepare?.Invoke(jobExecution);

                    await JobExecutionRepository.InsertAsync(jobExecution);

                    await unitOfWork.CompleteAsync();

                    return jobExecution.Id;
                }
            }
            catch (Exception e)
            {
                Logger.Error(e.Message, e);
                throw;
            }
        }

        public void Interrupt()
        {
            if (!CancellationTokenSource.IsCancellationRequested)
            {
                CancellationTokenSource.Cancel(true);
                Log.InfoFormat("Job {0} interrupt requested", Name);
            }
            else
            {
                Log.InfoFormat("Job {0} interrupt already in progress", Name);
            }
        }

        protected void CheckCancellation()
        {
            CancellationToken.ThrowIfCancellationRequested();
        }

        public virtual Task DoExecuteAsync(CancellationToken cancellationToken)
        {
            throw new Exception($"Method '{nameof(DoExecuteAsync)}' must be overridden in the scheduled job");
        }

        protected SignalrAppender AddSignalRAppender(string groupName)
        {
            var signalrAppender = new SignalrAppender(SignalrHub, groupName)
            {
                Name = Name + "SignalrAppender_" + groupName,
                Threshold = Level.All
            };

            var signalrLayout = new PatternLayout
            {
                ConversionPattern = "%d - %m%n%n"
            };

            signalrLayout.ActivateOptions();
            signalrAppender.Layout = signalrLayout;

            signalrAppender.ActivateOptions();

            _logger.AddAppender(signalrAppender);

            return signalrAppender;
        }

        private void AddInstanceAppenders(string fileName)
        {
            //Get the logger repository hierarchy.  
            var repository = LogManager.GetRepository(Assembly.GetCallingAssembly()) as Hierarchy;
            if (repository == null)
                throw new Exception("log4net repository was not configured");

            #region Configure signalRAppender

            var instanceSignalRAppender = AddSignalRAppender(JobExecutionId.ToString());

            #endregion

            #region Configure file appender

            FileAppender fileAppender = null;

            if (!string.IsNullOrWhiteSpace(fileName))
            {
                fileAppender = new FileAppender
                {
                    Name = Name + "FileAppender_" + JobExecutionId,
                    File = fileName,
                    AppendToFile = false,
                    Threshold = Level.All,
                    LockingModel = new FileAppender.MinimalLock(),
                    ImmediateFlush = true
                };

                var jsonLayout = new JsonLayout();
                jsonLayout.ActivateOptions();
                fileAppender.Layout = jsonLayout;

                fileAppender.ActivateOptions();

                _logger.AddAppender(fileAppender);
            }

            #endregion


            #region Configure Custom Appender
            ScheduledJobEventSourceAppender.OnLog += OnLog;
            var scheduledJobAppender = new ScheduledJobEventSourceAppender()
            {
                Name = Name + "ScheduledJobEventSourceAppender_" + JobExecutionId,
                Threshold = Level.All,
            };

            var scheduledJobLayout = new JsonLayout();
            scheduledJobLayout.ActivateOptions();

            scheduledJobAppender.Layout = scheduledJobLayout;

            scheduledJobAppender.ActivateOptions();
            _logger.AddAppender(scheduledJobAppender);
            #endregion

            if (repository.GetLogger(Name) is Logger log)
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

        private async Task<StoredFile> CreateStoredFileLog(string logPath, string filename, string folder = "")
        {
            using var stream = File.OpenRead(logPath);
            var storedFile = await _storedFileService.SaveFileAsync(stream, filename, file =>
            {
                file.Folder = folder;
            });
            return storedFile;
        }

        private void RemoveInstanceAppenders()
        {
            var appenders =
                _logger.Appenders.ToArray()
                    .Where(a => a.Name.EndsWith(JobExecutionId.ToString(), StringComparison.InvariantCultureIgnoreCase));
            foreach (var appender in appenders)
            {
                appender.Close();
                _logger.RemoveAppender(appender);
            }
        }

        private void ConfigureLogger()
        {
            //Get the logger repository hierarchy.  
            var repository = LogManager.GetRepository(Assembly.GetCallingAssembly()) as Hierarchy;

            if (repository == null)
                throw new Exception("log4net repository was not configured");

            repository.Root.Level = Level.Info;

            _logger = repository.GetCurrentLoggers().FirstOrDefault(l => l.Name == Name) as Logger;
            if (_logger == null)
            {
                // Configure default logger for scheduled job
                _logger = repository.LoggerFactory.CreateLogger(repository, Name);
                _logger.Additivity = false;
                _logger.Hierarchy = repository;
                _logger.Parent = repository.Root;
                _logger.Level = Level.All;

                var signalRAppender = AddSignalRAppender(Name);
                (repository.GetLogger(Name) as Logger)?.AddAppender(signalRAppender);


                // Mark repository as configured and notify that is has changed.  
                repository.Configured = true;
                repository.RaiseConfigurationChanged(EventArgs.Empty);
            }

            Log = LogManager.GetLogger(Assembly.GetCallingAssembly(), Name);
        }
    }

    public abstract class ScheduledJobBase: ScheduledJobBase<ScheduledJobStatistic>
    {
        
    }
}
