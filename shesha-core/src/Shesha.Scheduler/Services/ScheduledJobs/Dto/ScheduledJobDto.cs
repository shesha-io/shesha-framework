using System;
using Abp.Application.Services.Dto;
using Shesha.AutoMapper.Dto;

namespace Shesha.Scheduler.Services.ScheduledJobs.Dto
{
    public class ScheduledJobDto: EntityDto<Guid>
    {
        /// <summary>
        /// Name of the scheduled job
        /// </summary>
        public virtual string JobName { get; set; }

        /// <summary>
        /// Namespace
        /// </summary>
        public virtual string JobNamespace { get; set; }

        /// <summary>
        /// Description of the job
        /// </summary>
        public virtual string JobDescription { get; set; }

        /// <summary>
        /// Job status (Active/Inactive). Is used to switch job on/off.
        /// </summary>
        public virtual ReferenceListItemValueDto JobStatus { get; set; }

        /// <summary>
        /// Startup mode (Automatic/Manual)
        /// </summary>
        public virtual ReferenceListItemValueDto StartupMode { get; set; }
    }
}
