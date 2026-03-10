using Abp;
using Abp.Domain.Entities;

namespace Shesha.BackgroundProcesses.Exceptions
{
    /// <summary>
    /// Configuration Item not found exception
    /// </summary>
    public class LogFileIsUnavailableException : EntityNotFoundException, IHasErrorCode
    {
        /// <summary>
        /// Process Type
        /// </summary>
        public string ProcessType { get; set; }

        /// <summary>
        /// Process Id
        /// </summary>
        public string ProcessId { get; set; }

        /// <summary>
        /// Error code
        /// </summary>
        public int Code { get; set; }

        public LogFileIsUnavailableException(string processType, string processId) : base()
        {
            ProcessType = processType;
            ProcessId = processId;
            Code = 404;
        }

        public override string Message
        {
            get
            {
                return $"Log file for process {ProcessType} `{ProcessId}` is not available";
            }
        }
    }
}
