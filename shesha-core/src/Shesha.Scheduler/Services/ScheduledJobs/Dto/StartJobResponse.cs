using System;

namespace Shesha.Scheduler.Services.ScheduledJobs.Dto
{
    /// <summary>
    /// Start scheduled job response
    /// </summary>
    public class StartJobResponse
    {
        /// <summary>
        /// Job execution Id
        /// </summary>
        public Guid JobExecutionId { get; set; }

        public StartJobResponse(Guid jobExecutionId)
        {
            JobExecutionId = jobExecutionId;
        }
    }
}
