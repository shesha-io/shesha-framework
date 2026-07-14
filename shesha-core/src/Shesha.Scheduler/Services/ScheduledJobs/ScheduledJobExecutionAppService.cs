using Abp.Application.Services.Dto;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Linq.Extensions;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Shesha.Application.Services.Dto;
using Shesha.Authorization;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using Shesha.Scheduler.Domain;
using Shesha.Scheduler.SignalR;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Scheduler.Services.ScheduledJobs
{
    [SheshaAuthorize(RefListPermissionedAccess.RequiresPermissions, ShaPermissionNames.Pages_Maintenance)]
    public class ScheduledJobExecutionAppService : SheshaAppServiceBase, ITransientDependency
    {
        private readonly IRepository<ScheduledJobExecution, Guid> _repository;
        private readonly IMimeMappingService _mimeMappingService;
        private readonly IStoredFileService _storedFileService;

        public ScheduledJobExecutionAppService(
            IRepository<ScheduledJobExecution, Guid> repository,
            IMimeMappingService mimeMappingService,
            IStoredFileService storedFileService)
        {
            _repository = repository;
            _mimeMappingService = mimeMappingService;
            _storedFileService = storedFileService;
        }

        /// <summary>
        /// Get list of scheduled job executions
        /// </summary>
        public async Task<PagedResultDto<DynamicDto<ScheduledJobExecution, Guid>>> GetAllAsync(FilteredPagedAndSortedResultRequestDto input)
        {
            var query = _repository.GetAll()
                .ApplyFilter<ScheduledJobExecution, Guid>(input.Filter);

            var totalCount = await AsyncQueryableExecuter.CountAsync(query);

            query = string.IsNullOrWhiteSpace(input.Sorting)
                ? query.OrderByDescending(e => e.StartedOn)
                : query.OrderBy(input.Sorting);
            query = query.PageBy(input);

            var entities = await AsyncQueryableExecuter.ToListAsync(query);

            var settings = new DynamicMappingSettings { UseDtoForEntityReferences = true };
            var items = new List<DynamicDto<ScheduledJobExecution, Guid>>();
            foreach (var entity in entities)
            {
                items.Add(await MapToDynamicDtoAsync<ScheduledJobExecution, Guid>(entity, settings));
            }

            return new PagedResultDto<DynamicDto<ScheduledJobExecution, Guid>>(totalCount, items);
        }

        /// <summary>
        /// Get scheduled job execution by id
        /// </summary>
        public async Task<DynamicDto<ScheduledJobExecution, Guid>> GetAsync(EntityDto<Guid> input)
        {
            var entity = await _repository.GetAsync(input.Id);
            return await MapToDynamicDtoAsync<ScheduledJobExecution, Guid>(entity, new DynamicMappingSettings { UseDtoForEntityReferences = true });
        }

        /// <summary>
        /// Get event log items for the specified job execution
        /// </summary>
        /// <returns></returns>
        public async Task<List<EventLogItem>> GetEventLogItemsAsync(Guid id)
        {
            if (id == Guid.Empty)
                return new List<EventLogItem>();

            var execution = await _repository.GetAsync(id);

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
                logFileContent = await storedFileContent.ReadToEndAsync();

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
        public async Task<ScheduledJobStatistic> GetExecutionStatisticsAsync(Guid id)
        {
            if (id == Guid.Empty)
                return null;

            var execution = await _repository.GetAsync(id);

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
            var jobExecution = await _repository.GetAsync(id);

            var jobLogMode = jobExecution.Job.LogMode;

            FileStreamResult result;
            if (jobLogMode == Domain.Enums.LogMode.StoredFile)
            {
                if (jobExecution.LogFile == null)
                    throw new Exception("Log file not found");

                var fileVersion = jobExecution.LogFile.LastVersion();
                if (fileVersion == null)
                    throw new Exception("File version not found");

#pragma warning disable IDISP001 // Dispose created
                var fileContentStream = await _storedFileService.GetStreamAsync(fileVersion);
#pragma warning restore IDISP001 // Dispose created

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

#pragma warning disable IDISP001 // Dispose created
                var stream = new FileStream(
                    jobExecution.LogFilePath,
                    FileMode.Open,
                    FileAccess.Read,
                    FileShare.ReadWrite);
#pragma warning restore IDISP001 // Dispose created

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
