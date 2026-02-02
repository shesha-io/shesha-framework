using Shesha.BackgroundProcesses.Models;

namespace Shesha.BackgroundProcesses.Dtos
{
    /// <summary>
    /// Represents state of background process
    /// </summary>
    public class ProcessState
    {
        /// <summary>
        /// Process status (e.g. running, completed, failed)
        /// </summary>
        public string Status { get; set; }

        public string Log { get; set; }
    }
}
