using Abp.Application.Services.Dto;
using Shesha.AutoMapper.Dto;
using Shesha.JsonEntities;
using System;

namespace Shesha.Scheduler.Services.ScheduledJobs.Dto
{
    public class ScheduledJobExecutionDto : EntityDto<Guid>
    {
        /// <summary>
        /// Datetime of the execution start
        /// </summary>
        public DateTime? StartedOn { get; set; }

        /// <summary>
        /// Datetime of the execution finish
        /// </summary>
        public DateTime? FinishedOn { get; set; }

        /// <summary>
        /// User who started the job (if it was done manually)
        /// </summary>
        public EntityReferenceDto<Int64?> StartedBy { get; set; }

        /// <summary>
        /// Executed scheduled job
        /// </summary>
        public EntityReferenceDto<Guid?> Job { get; set; }

        /// <summary>
        /// Trigger by which the job was executed. May be null for manual jobs
        /// </summary>
        public EntityReferenceDto<Guid?> Trigger { get; set; }

        /// <summary>
        /// Error message
        /// </summary>
        public string ErrorMessage { get; set; }

        /// <summary>
        /// Status of the execution
        /// </summary>
        public ReferenceListItemValueDto Status { get; set; }

        /// <summary>
        /// Job Statistics
        /// </summary>
        public JsonEntity JobStatistics { get; set; }

    }
}
