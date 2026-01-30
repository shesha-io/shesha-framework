using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.BackgroundProcesses;
using Shesha.BackgroundProcesses.Models;
using Shesha.Extensions;
using Shesha.Scheduler.Domain;
using Shesha.Scheduler.Domain.Enums;
using Shesha.Services;
using Shesha.Utilities;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Shesha.Scheduler.ProcessMonitor
{
    public class ScheduledJobExecutionProcessMonitor : IProcessMonitor, ITransientDependency
    {
        private readonly IStoredFileService _storedFileService;
        private readonly IRepository<ScheduledJobExecution, Guid> _executionRepository;

        public string ProcessType => "ScheduledJobExecution";

        public ScheduledJobExecutionProcessMonitor(IStoredFileService storedFileService, IRepository<ScheduledJobExecution, Guid> executionRepository)
        {
            _storedFileService = storedFileService;
            _executionRepository = executionRepository;
        }

        public async Task<string> GetLogContentAsync(string processId)
        {
            var execution = await GetExecutionAsync(processId);

            var jobLogMode = execution.Job.LogMode;

            string logFileContent = "";

            if (jobLogMode == Domain.Enums.LogMode.StoredFile)
            {
                if (execution.LogFile == null)
                    throw new Exception("Log file not found");

                var fileVersion = execution.LogFile.LastVersion();
                if (fileVersion == null)
                    throw new Exception("File version not found");

                using (var fileContentStream = await _storedFileService.GetStreamAsync(fileVersion)) 
                {
                    using var storedFileContent = new StreamReader(fileContentStream);
                    logFileContent = await storedFileContent.ReadToEndAsync();
                }                
            }
            else
            {
                var logfilePath = execution.LogFilePath;
                if (!File.Exists(logfilePath))
                    return string.Empty;

                logFileContent = await File.ReadAllTextAsync(logfilePath);
            }

            return logFileContent;
        }

        public async Task<LogFileInfo> GetLogFileInfoAsync(string processId)
        {
            var execution = await GetExecutionAsync(processId);
            
            if (execution.Job.LogMode == Domain.Enums.LogMode.StoredFile)
            {
                var fileVersion = execution.LogFile?.LastVersion();
                
                return fileVersion != null
                    ? LogFileInfo.Available(fileVersion.FileName, () => _storedFileService.GetStreamAsync(fileVersion))
                    : LogFileInfo.Unavailable();
            }
            else
            {
                return !string.IsNullOrWhiteSpace(execution.LogFilePath) && File.Exists(execution.LogFilePath)
                    ? LogFileInfo.Available(execution.LogFilePath, () => Task.FromResult(File.OpenRead(execution.LogFilePath) as Stream))
                    : LogFileInfo.Unavailable();
            }
        }

        public async Task<ProcessStatus> GetStatusAsync(string processId)
        {
            var execution = await GetExecutionAsync(processId);
            return execution.Status switch
            {
                ExecutionStatus.InProgress => ProcessStatus.Running,
                ExecutionStatus.Completed => ProcessStatus.Completed,
                ExecutionStatus.Failed => ProcessStatus.Failed,
                ExecutionStatus.Cancelled => ProcessStatus.Cancelled,
                _ => ProcessStatus.Idle
            };            
        }

        private async Task<ScheduledJobExecution> GetExecutionAsync(string processId) 
        {
            var id = processId.ToGuid();

            return await _executionRepository.GetAsync(id);
        }
    }
}
