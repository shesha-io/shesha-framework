using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Extensions;
using Microsoft.Extensions.Configuration;
using NHibernate.Linq;
using Shesha.Authorization.Users;
using Shesha.Domain;
using Shesha.Exceptions;
using Shesha.Reflection;
using Shesha.Scheduler.Attributes;
using Shesha.Scheduler.Domain;
using Shesha.Scheduler.Domain.Enums;
using Shesha.Services;
using Shesha.Utilities;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using System.Transactions;
using ILogger = Castle.Core.Logging.ILogger;

namespace Shesha.Scheduler
{
    /// <summary>
    /// Scheduled job base class
    /// </summary>
    public abstract class ScheduledJobBase<T>: ScheduledJobBase where T : ScheduledJobStatistic, new()
    {
        public virtual T JobStatistics { get; private set; }

        protected ScheduledJobBase()
        {
            JobStatistics = new T();
        }

        public override void SuccessExecutionInfo()
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
        }
    }

    public abstract class ScheduledJobBase
    {
        public IRepository<User, Int64> UserRepository { get; set; }

        private IStoredFileService _storedFileService => IocManager?.Resolve<IStoredFileService>();

        public string Name => GetType().StripCastleProxyType().Name;
        public string TriggerName => $"{Name}_Trigger";

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

        protected LogMode _logMode
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

        /// <summary>
        /// Reference to the logger to write logs.
        /// </summary>
        protected ILogger Logger => _defaultLogger ??= IocManager.Resolve<ILogger>();

        /// <summary>
        /// Default logger, it used when instance logger is not set
        /// </summary>
        private ILogger _defaultLogger;

        public ILogger Log { get; set; }

        public Guid JobExecutionId { get; set; }
        public string LogFileName { get; set; }
        public string LogFilePath { get; set; }
        public string LogFolderPath
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

        public string LogFolderName
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

        public Guid? TriggerId { get; set; }

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
            var task = Task.Run(async () =>
            {
                try
                {
                    //SaveJobExecutionIdForLogging();

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

        /*public virtual void OnLog(object sender, ScheduledJobOnLogEventArgs e)
        {

        }*/


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

        public void FailExecutionInfo(Exception e)
        {
            UpdateExecutionInfo(execution =>
            {
                execution.ErrorMessage = e.FullMessage();
                execution.Status = ExecutionStatus.Failed;
            });

        }

        public virtual void SuccessExecutionInfo()
        {
            UpdateExecutionInfo(e =>
            {
                e.FinishedOn = DateTime.Now;
                if (e.Status == ExecutionStatus.InProgress)
                    e.Status = ExecutionStatus.Completed;

                if (_logMode == LogMode.StoredFile)
                    e.LogFile = AsyncHelper.RunSync(() => { return CreateStoredFileLog(LogFilePath, LogFileName, LogFolderName); });
            });
        }

        public void UpdateExecutionInfo(Action<ScheduledJobExecution> updateAction)
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

        public async Task<Guid> AddStartExecutionRecordAsync(Guid executionId, Int64? startedById)
        {
            return await CreateExecutionRecordAsync(executionId,
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

        protected async Task<StoredFile> CreateStoredFileLog(string logPath, string filename, string folder = "")
        {
            using var stream = File.OpenRead(logPath);
            var storedFile = await _storedFileService.SaveFileAsync(stream, filename, file =>
            {
                file.Folder = folder;
            });
            return storedFile;
        }
    }
}
