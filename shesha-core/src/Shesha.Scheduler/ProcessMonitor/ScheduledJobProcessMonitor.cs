using Abp.Dependency;
using Shesha.BackgroundProcesses;
using Shesha.BackgroundProcesses.Models;
using Shesha.Extensions;
using Shesha.Utilities;
using System.Threading.Tasks;

namespace Shesha.Scheduler.ProcessMonitor
{
    public class ScheduledJobProcessMonitor : IProcessMonitor, ITransientDependency
    {
        private readonly IScheduledJobManager _jobManager;        

        public string ProcessType => "ScheduledJob";

        public ScheduledJobProcessMonitor(IScheduledJobManager jobManager)
        {
            _jobManager = jobManager;
        }

        public Task<string> GetLogContentAsync(string processId)
        {
            return Task.FromResult(string.Empty);
        }

        public Task<LogFileInfo> GetLogFileInfoAsync(string processId)
        {
            return Task.FromResult(LogFileInfo.Unavailable());
        }

        public async Task<ProcessStatus> GetStatusAsync(string processId)
        {
            var inProgress = await _jobManager.IsJobInProgressAsync(processId.ToGuid());
            return inProgress 
                ? ProcessStatus.Running 
                : ProcessStatus.Idle;
        }        
    }
}
