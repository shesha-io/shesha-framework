using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Scheduler.Domain;
using Shesha.Scheduler.Services.ScheduledJobs.Dto;
using Shesha.Scheduler.SignalR;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace Shesha.Scheduler.Services.ScheduledJobs
{
    public class ScheduledJobExecutionAppService : SheshaCrudServiceBase<ScheduledJobExecution, ScheduledJobExecutionDto, Guid>, ITransientDependency
    {
        private readonly IMimeMappingService _mimeMappingService;
        private readonly IRepository<StoredFileVersion, Guid> _fileVersionRepository;
        private readonly IStoredFileService _storedFileService;

        public ScheduledJobExecutionAppService(IRepository<ScheduledJobExecution, Guid> repository,
            IMimeMappingService mimeMappingService, 
            IRepository<StoredFileVersion, Guid> fileVersionRepository,
            IStoredFileService storedFileService) : base(repository)
        {
            _mimeMappingService = mimeMappingService;
            _fileVersionRepository = fileVersionRepository;
            _storedFileService = storedFileService;
        }

        /// <summary>
        /// Get event log items for the specified job execution
        /// </summary>
        /// <returns></returns>
        public async Task<List<EventLogItem>> GetEventLogItems(Guid id)
        {
            if (id == Guid.Empty)
                return new List<EventLogItem>();

            var execution = await Repository.GetAsync(id);

            var jobLogMode = execution.Job.LogMode;
           

            string logFileContent = "";

            if (jobLogMode == Domain.Enums.LogMode.StoredFile)
            {
                if (execution.LogFile == null)
                    throw new Exception("Log file not found");

                var fileVersion = execution.LogFile.LastVersion();
                if (fileVersion == null)
                    throw new Exception("File version not found");

                var fileContentStream = await _storedFileService.GetStreamAsync(fileVersion);

                using var storedFileContent = new StreamReader(fileContentStream);
                logFileContent = storedFileContent.ReadToEnd();

            } else
            {
                var logfilePath = execution.LogFilePath;
                if (!File.Exists(logfilePath))
                    throw new Exception("Log file not found");

                logFileContent = await File.ReadAllTextAsync(logfilePath);
            }

            
            var logItems = JsonConvert.DeserializeObject<List<EventLogItem>>("[" + logFileContent + "]");

            return logItems;
        }

        /// <summary>
        /// Get the execution statistics for the 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<ScheduledJobStatistic> GetExecutionStatistics(Guid id)
        {
            if (id == Guid.Empty)
                return null;

            var execution = await Repository.GetAsync(id);

            return execution.JobStatistics;
        }

        /// <summary>
        /// Download log file of the job execution
        /// </summary>
        /// <param name="id">Id of the scheduled job execution</param>
        /// <returns></returns>
        [HttpGet]
        public async Task<FileStreamResult> DownloadLogFileAsync(Guid id)
        {
            var jobExecution = await Repository.GetAsync(id);

            var jobLogMode = jobExecution.Job.LogMode;

            FileStreamResult result;
            if (jobLogMode == Domain.Enums.LogMode.StoredFile)
            {
                if (jobExecution.LogFile == null)
                    throw new Exception("Log file not found");

                var fileVersion = jobExecution.LogFile.LastVersion();
                if (fileVersion == null)
                    throw new Exception("File version not found");

                var fileContentStream = await _storedFileService.GetStreamAsync(fileVersion);
                await _storedFileService.MarkDownloadedAsync(fileVersion);

                result = new FileStreamResult(fileContentStream, fileVersion.FileType.GetContentType())
                {
                    FileDownloadName = fileVersion.FileName,
                };
            }
            else
            {
                if (string.IsNullOrWhiteSpace(jobExecution.LogFilePath))
                    throw new EntityNotFoundException("Path to the log file for the specified job execution is not specified");

                if (!File.Exists(jobExecution.LogFilePath))
                    throw new EntityNotFoundException("Log file is missing on disk");

                var stream = new FileStream(jobExecution.LogFilePath, FileMode.Open);
                var fileName = Path.GetFileName(jobExecution.LogFilePath);
                var contentType = _mimeMappingService.Map(fileName);

                result = new FileStreamResult(stream, contentType)
                {
                    FileDownloadName = fileName
                };
            }

            return result;

            
        }
    }
}
