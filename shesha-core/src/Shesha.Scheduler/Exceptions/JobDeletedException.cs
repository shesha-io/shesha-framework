using System;

namespace Shesha.Scheduler.Exceptions
{
    /// <summary>
    /// 
    /// </summary>
    public class JobDeletedException : Exception
    {
        public Guid JobId { get; private set; }

        public JobDeletedException(Guid jobId, Guid triggerId) : base($"Job with Id = '{jobId}' is deleted, execution of trigger '{triggerId}' skipped") 
        {
            JobId = jobId;
        }
    }
}
