using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Extensions;
using Castle.Core.Logging;
using Hangfire.Server;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
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
    public abstract class ScheduledJobBase<TStat, TParams> : ScheduledJobBase, IParametrizedJob<TParams>
        where TStat : ScheduledJobStatistic, new()
        where TParams : class, new()
    {
        public virtual TParams JobParameters { get; private set; }

        public virtual TStat JobStatistics { get; private set; }

        protected ScheduledJobBase()
        {
            JobStatistics = new TStat();
        }

        public override Task MarkExecutionAsSuccessAsync()
        {
            return UpdateExecutionInfoAsync(async e =>
            {
                e.FinishedOn = DateTime.Now;
                e.Status = ExecutionStatus.Completed;

                if (_logMode == LogMode.StoredFile)
                    e.LogFile = await CreateStoredFileLogAsync(LogFilePath, LogFileName, LogFolderName);

                if (JobStatistics != null)
                    e.JobStatistics = JobStatistics;
            });
        }

        public Task ReadParametersJsonAsync(string json)
        {
            JobParameters = JsonConvert.DeserializeObject<TParams>(json);
            return Task.CompletedTask;
        }
    }

    public abstract class ScheduledJobBase<T> : ScheduledJobBase<T, object>
        where T : ScheduledJobStatistic, new()
    { 
    }

    public abstract class ScheduledJobBase
    {
        public IRepository<User, Int64> UserRepository { get; set; }

        private IStoredFileService _storedFileService => IocManager?.Resolve<IStoredFileService>();

        public string Name => GetType().StripCastleProxyType().Name;
        public string TriggerName => $"{Name}_Trigger";

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
        protected ILogger Logger => Log ?? NullLogger.Instance;

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
        /// <param name="context"></param>
        /// <returns></returns>
        [UnitOfWork]
        public async Task ExecuteAsync(Guid executionId, Int64? startedById, CancellationToken cancellationToken, PerformContext context = null)
        {
            var task = Task.Run(async () =>
            {
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
            }, CancellationToken);


            await task;
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

        public async Task MarkExecutionAsFailureAsync(Exception e)
        {
            await UpdateExecutionInfoAsync(execution =>
            {
                execution.ErrorMessage = e.FullMessage();
                execution.Status = ExecutionStatus.Failed;
                return Task.CompletedTask;
            });
        }

        public async Task StartExecutionAsync(Guid executionId)
        {
            JobExecutionId = executionId;

            await UpdateExecutionInfoAsync(execution =>
            {
                this.TriggerId = execution.Trigger?.Id;

                execution.Status = ExecutionStatus.InProgress;

                LogFileName = !string.IsNullOrWhiteSpace(execution.LogFilePath) ? Path.GetFileName(execution.LogFilePath) : null;
                LogFilePath = execution.LogFilePath;

                return Task.CompletedTask;
            });
        }

        public async Task MarkExecutionAsCancelledAsync(Exception e)
        {
            await UpdateExecutionInfoAsync(execution =>
            {
                execution.ErrorMessage = e.FullMessage();
                execution.Status = ExecutionStatus.Cancelled;
                return Task.CompletedTask;
            });
        }

        public virtual async Task MarkExecutionAsSuccessAsync()
        {
            await UpdateExecutionInfoAsync(async e =>
            {
                e.FinishedOn = DateTime.Now;
                e.Status = ExecutionStatus.Completed;

                if (_logMode == LogMode.StoredFile)
                    e.LogFile = await CreateStoredFileLogAsync(LogFilePath, LogFileName, LogFolderName);
            });
        }

        public async Task UpdateExecutionInfoAsync(Func<ScheduledJobExecution, Task> updateAction)
        {
            try
            {
                if (JobExecutionId == Guid.Empty)
                    return;

                using (var unitOfWork = UnitOfWorkManager.Begin())
                {
                    var jobExecution = await JobExecutionRepository.GetAsync(JobExecutionId);
                    await updateAction.Invoke(jobExecution);
                    await JobExecutionRepository.UpdateAsync(jobExecution);

                    // save changes
                    await unitOfWork.CompleteAsync();
                }
            }
            catch (Exception e)
            {
                // rollback
                Logger.Error(e.Message, e);
                throw;
            }
        }

        public async Task CreateExecutionRecordAsync(Guid executionId, Int64? startedById)
        {
            try
            {
                if (executionId == Guid.Empty)
                    throw new Exception($"{nameof(executionId)} must not be empty");

                using (var unitOfWork = UnitOfWorkManager.Begin(TransactionScopeOption.RequiresNew))
                {
                    var logFileName = $"{DateTime.Now:yyyy-MM-dd_HHmmss}_{executionId}.log";
                    var logFilePath = PathHelper.MapVirtualPath($"{LogFolderPath}/{LogFolderName}/{logFileName}");

                    var job = await JobRepository.GetAsync(Id);
                    var trigger = GetTrigger();
                    var jobExecution = new ScheduledJobExecution()
                    {
                        Id = executionId,
                        Job = job,
                        StartedOn = DateTime.Now,
                        Status = ExecutionStatus.Enqueued,
                        Trigger = trigger,
                        LogFilePath = logFilePath,
                        StartedBy = startedById.HasValue
                            ? await UserRepository.GetAsync(startedById.Value)
                            : null
                    };

                    await JobExecutionRepository.InsertAsync(jobExecution);

                    await unitOfWork.CompleteAsync();
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

        protected async Task<StoredFile> CreateStoredFileLogAsync(string logPath, string filename, string folder = "")
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
