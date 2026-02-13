using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using System.Transactions;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.ObjectMapping;
using log4net;
using log4net.Appender;
using log4net.Core;
using log4net.Layout;
using log4net.Repository.Hierarchy;
using Microsoft.AspNetCore.SignalR;
using Shesha.Configuration;
using Shesha.Domain;
using Shesha.Scheduler.SignalR;
using Shesha.Services;
using Shesha.Utilities;

namespace Shesha.Import
{
    /// <summary>
    /// Base class of the import process
    /// </summary>
    public abstract class ImportServiceBase<T> : IAsyncImport<T> where T : ImportResult
    {
        private readonly IIocResolver _iocResolver;
        protected IStoredFileService _fileService;
        protected IRepository<T, Guid> ImportResultsRepository;
        protected readonly IUnitOfWorkManager _unitOfWorkManager;
        protected readonly ISheshaSettings SheshaSettings;
        
        /// <summary>
        /// Reference to the object to object mapper.
        /// </summary>
        public IObjectMapper ObjectMapper { get; set; } = NullObjectMapper.Instance;

        private string _loggerName;
        private string _logGroupName;
        protected ILog _logger;
        
        protected ImportServiceBase(IIocResolver iocResolver, IStoredFileService fileService, IRepository<T, Guid> importResultsRepository, IUnitOfWorkManager unitOfWorkManager, ISheshaSettings sheshaSettings)
        {
            _iocResolver = iocResolver;
            _fileService = fileService;
            ImportResultsRepository = importResultsRepository;
            _unitOfWorkManager = unitOfWorkManager;
            SheshaSettings = sheshaSettings;
           
            ObjectMapper = NullObjectMapper.Instance;
        }

        private void EnsureLoggerInitialized()
        {
            if (_logger != null)
                return;

            _loggerName = this.GetType().Name;
            _logGroupName = this.GetType().Name;
            _logger = CreateLogger(_loggerName);
        }

        public void SetExternalLogger(ILog logger, string logGroupName) 
        {
            _logger = logger;
            _logGroupName = logGroupName;
            _loggerName = _logger.Logger.Name;
        }

        private ILog CreateLogger(string loggerName)
        {
            //Get the logger repository hierarchy.  
            var repository = LogManager.GetRepository(Assembly.GetCallingAssembly()) as Hierarchy;

            if (repository == null)
                throw new Exception("log4net repository was not configured");

            var existingLogger = repository.GetCurrentLoggers().FirstOrDefault(l => l.Name == loggerName);
            if (existingLogger == null)
            {
                // Configure default logger for scheduled job
                var logger = repository.LoggerFactory.CreateLogger(repository, loggerName);
                logger.Additivity = true;
                logger.Hierarchy = repository;
                logger.Parent = repository.Root;
                logger.Level = Level.Info;

                // Mark repository as configured and notify that is has changed.  
                repository.Configured = true;
                repository.RaiseConfigurationChanged(EventArgs.Empty);
            }
            return LogManager.GetLogger(Assembly.GetCallingAssembly(), loggerName);
        }

        protected void ConfigureAppenders(string fileName)
        {
            //Get the logger repository hierarchy.  
            if (!(LogManager.GetRepository(Assembly.GetCallingAssembly()) is Hierarchy repository))
                throw new Exception("log4net repository was not configured");

            if (!(repository.GetLogger(_loggerName) is Logger logger))
                throw new Exception($"Logger '{_loggerName}' not found");

            #region Configure signalRAppender

            if (logger.Appenders.OfType<SignalrAppender>().All(a => a.GroupName != _logGroupName))
            {
                //var hub = GlobalHost.ConnectionManager.GetHubContext<SignalrAppenderHub>();
                var hubContext = _iocResolver.Resolve<IHubContext<SignalrAppenderHub>>();
                var signalrAppender = new SignalrAppender(hubContext, _logGroupName)
                {
                    Name = _loggerName + "SignalrAppenderAuto",
                    Threshold = Level.All,
                };

                var signalrLayout = new PatternLayout()
                {
                    ConversionPattern = "%d - %m%n%n"
                };

                signalrLayout.ActivateOptions();
                signalrAppender.Layout = signalrLayout;
                signalrAppender.ActivateOptions();

                logger.AddAppender(signalrAppender);
            }

            #endregion

            #region Configure file appender

            if (!string.IsNullOrWhiteSpace(fileName))
            {
                var fileAppender = new FileAppender
                {
                    Name = _loggerName + "FileAppenderAuto",
                    File = fileName,
                    AppendToFile = false,
                    Threshold = Level.All,
                    LockingModel = new FileAppender.MinimalLock()
                };
                //new log4net.Util.PatternString("D:\Temp\Logs\%property{LogName}.log")

                var fileLayout = new PatternLayout()
                {
                    ConversionPattern = "%d - %m%n%n"
                };

                fileLayout.ActivateOptions();
                fileAppender.Layout = fileLayout;
                fileAppender.ActivateOptions();

                logger.AddAppender(fileAppender);
            }

            #endregion

            // Mark repository as configured and notify that is has changed.  
            repository.Configured = true;
            repository.RaiseConfigurationChanged(EventArgs.Empty);

            _logger = LogManager.GetLogger(Assembly.GetCallingAssembly(), _loggerName);
        }

        protected void RemoveAppenders()
        {
            //Get the logger repository hierarchy.  
            var repository = LogManager.GetRepository(Assembly.GetCallingAssembly()) as Hierarchy;
            if (repository == null)
                throw new Exception("log4net repository was not configured");

            var logger = repository.GetLogger(_loggerName) as Logger;
            if (logger == null)
                throw new Exception(string.Format("Logger '{0}' not found", _loggerName));

            var appenders =
                logger.Appenders.ToArray()
                    .Where(a => a.Name.EndsWith("Auto", StringComparison.InvariantCultureIgnoreCase));
            foreach (var appender in appenders)
            {
                logger.RemoveAppender(appender);
            }
        }

        /// <summary>
        /// Updates import result record. Note: works in a separate session to isolate import process and import result in case of transaction rollback
        /// </summary>
        /// <param name="id"></param>
        /// <param name="updateAction"></param>
        protected async Task UpdateImportResultAsync(Guid id, Func<T, Task> updateAction)
        {
            using (var uow = _unitOfWorkManager.Begin(TransactionScopeOption.RequiresNew))
            {
                var result = await ImportResultsRepository.GetAsync(id);
                
                await updateAction.Invoke(result);

                await ImportResultsRepository.InsertOrUpdateAsync(result);

                await uow.CompleteAsync();
            }
        }

        private void GenerateLogFileName(T result, DateTime date) 
        {
            if (!string.IsNullOrWhiteSpace(result.LogFilePath))
                return;

            var appDataPath = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            result.LogFilePath = Path.Combine(appDataPath, "ImportLogs", $"{date:yyyyMMdd-hh.mm.ss}_{result.ImportedFile.FileName}.log");
        }

        public async Task ImportAsync(Guid importResultId, CancellationToken cancellationToken)
        {
            EnsureLoggerInitialized();

            var logFileName = Path.GetTempFileName();

            await UpdateImportResultAsync(importResultId, result =>
            {
                result.StartedOn = result.StartedOn ?? DateTime.Now;
                GenerateLogFileName(result, result.StartedOn.Value);
                logFileName = result.LogFilePath;
                return Task.CompletedTask;
            });

            ConfigureAppenders(logFileName);
            try
            {
                try
                {
                    using (var uow = _unitOfWorkManager.Begin(TransactionScopeOption.RequiresNew))
                    {
                        var importResult = await ImportResultsRepository.GetAsync(importResultId);
                        await DoImportAsync(importResult, cancellationToken, _logger);
                        
                        await uow.CompleteAsync();
                    }
                }
                catch (Exception e)
                {
                    await UpdateImportResultAsync(importResultId, result =>
                    {
                        result.ErrorMessage = e.Message;
                        return Task.CompletedTask;
                    });
                    
                    if (e is OperationCanceledException)
                        throw;
                }
            }
            finally
            {
                RemoveAppenders();
            }
        }

        public async Task ImportAsync(string fileName, Stream stream, CancellationToken cancellationToken)
        {
            await ImportAsync(fileName, stream, cancellationToken, null);
        }

        public async Task ImportAsync(string fileName, Stream stream, CancellationToken cancellationToken, Action<T>? prepareResultAction)
        {
            EnsureLoggerInitialized();
            try
            {
                Guid importResultId = Guid.Empty;

                // Save info about the import to the DB (including imported file and log file)
                using (var uow = _unitOfWorkManager.Begin(scope: TransactionScopeOption.RequiresNew))
                {
                    var importResult = Activator.CreateInstance<T>();
                    
                    importResult.ImportedFile = await _fileService.SaveFileAsync(stream, fileName);
                    importResult.ImportedFileMD5 = FileHelper.GetMD5(stream);
                    importResult.StartedOn = DateTime.Now;
                    GenerateLogFileName(importResult, importResult.StartedOn.Value);

                    prepareResultAction?.Invoke(importResult);

                    await ImportResultsRepository.InsertAsync(importResult);

                    await uow.CompleteAsync();
                    
                    importResultId = importResult.Id;
                }

                await ImportAsync(importResultId, cancellationToken);
            }
            catch (Exception e)
            {
                _logger.Error(e.Message, e);
                throw;
            }
        }

        /// <summary>
        /// Import process, should be overrided in the derived classes
        /// </summary>
        /// <param name="importResult">Detailed results of the import including error message</param>
        /// <param name="cancellationToken"></param>
        /// <param name="logger">Logger to log all messages</param>
        protected abstract Task DoImportAsync(T importResult, CancellationToken cancellationToken, ILog logger);        
    }
}
