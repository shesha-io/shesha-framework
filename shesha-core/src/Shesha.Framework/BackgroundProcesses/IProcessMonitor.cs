using Shesha.BackgroundProcesses.Models;
using System.Threading.Tasks;

namespace Shesha.BackgroundProcesses
{
    /// <summary>
    /// Process monitor. Returns information about running processes
    /// </summary>
    public interface IProcessMonitor
    {
        /// <summary>
        /// Process type this monitor is for
        /// </summary>
        string ProcessType { get; }
        
        /// <summary>
        /// Get process status
        /// </summary>
        /// <param name="processId">Process Id</param>
        /// <returns></returns>
        Task<ProcessStatus> GetStatusAsync(string processId);

        /// <summary>
        /// Get process log events
        /// </summary>
        /// <param name="processId">Process Id</param>
        /// <returns></returns>
        Task<string> GetLogContentAsync(string processId);

        Task<LogFileInfo> GetLogFileInfoAsync(string processId);
    }    
}
