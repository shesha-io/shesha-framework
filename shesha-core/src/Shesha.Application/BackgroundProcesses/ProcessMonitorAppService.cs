using Microsoft.AspNetCore.Mvc;
using Shesha.BackgroundProcesses.Dtos;
using Shesha.BackgroundProcesses.Exceptions;
using Shesha.BackgroundProcesses.Models;
using Shesha.Extensions;
using Shesha.Utilities;
using System;
using System.Threading.Tasks;

namespace Shesha.BackgroundProcesses
{
    public class ProcessMonitorAppService: SheshaAppServiceBase
    {
        private readonly IProcessMonitorProvider _processMonitorProvider;

        public ProcessMonitorAppService(IProcessMonitorProvider processMonitorProvider)
        {
            _processMonitorProvider = processMonitorProvider;
        }

        public async Task<ProcessState> GetProcessStateAsync(string processType, string processId)
        { 
            var processMonitor = _processMonitorProvider.GetProcessMonitor(processType);

            var status = await processMonitor.GetStatusAsync(processId);
            var state = new ProcessState
            {
                Status = ProcessStatusToText(status),
                Log = await processMonitor.GetLogContentAsync(processId),
            };
            return state;            
        }

        private string ProcessStatusToText(ProcessStatus status)
        {
            return Enum.GetName(status)?.ToCamelCase() ?? "unknown";
        }

        public async Task<string> GetStatusAsync(string processType, string processId) 
        {
            var processMonitor = _processMonitorProvider.GetProcessMonitor(processType);

            var status = await processMonitor.GetStatusAsync(processId);
            return ProcessStatusToText(status);
        }

        public async Task<FileStreamResult> DownloadLogFileAsync(string processType, string processId) 
        {
            var processMonitor = _processMonitorProvider.GetProcessMonitor(processType);

            var logInfo = await processMonitor.GetLogFileInfoAsync(processId);

            if (!logInfo.IsAvailable)
                throw new LogFileIsUnavailableException(processType, processId);

#pragma warning disable IDISP001 // Dispose created
            var fileContentStream = await logInfo.StreamGetter();
#pragma warning restore IDISP001 // Dispose created
            var result = new FileStreamResult(fileContentStream, logInfo.FileName.GetContentType())
            {
                FileDownloadName = logInfo.FileName,
            };
            return result;            
        }
    }
}
