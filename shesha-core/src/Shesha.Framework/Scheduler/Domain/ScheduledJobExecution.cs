using Abp.Domain.Entities.Auditing;
using Shesha.Authorization.Users;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Scheduler.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Scheduler.Domain
{
    /// <summary>
    /// Contains info about scheduled job execution
    /// </summary>
    [Entity(TypeShortAlias = "Shesha.Scheduler.ScheduledJobExecution", FriendlyName = "Scheduled Job Execution")]
    [Table("Core_ScheduledJobExecutions")]
    public class ScheduledJobExecution : FullAuditedEntity<Guid>
    {
        /// <summary>
        /// Datetime of the execution start
        /// </summary>
        public virtual DateTime? StartedOn { get; set; }

        /// <summary>
        /// Datetime of the execution finish
        /// </summary>
        public virtual DateTime? FinishedOn { get; set; }

        /// <summary>
        /// Log file path
        /// </summary>
        [MaxLength(500)]
        public virtual string? LogFilePath { get; set; }

        /// <summary>
        /// Stored file log (if enabled on the job)
        /// </summary>
        public virtual StoredFile? LogFile { get; set; }

        /// <summary>
        /// User who started the job (if it was done manually)
        /// </summary>
        public virtual User? StartedBy { get; set; }

        /// <summary>
        /// Executed scheduled job
        /// </summary>
        public virtual ScheduledJob Job { get; set; } = default!;

        /// <summary>
        /// Trigger by which the job was executed. May be null for manual jobs
        /// </summary>
        public virtual ScheduledJobTrigger? Trigger { get; set; }

        /// <summary>
        /// Error message
        /// </summary>
        [MaxLength(int.MaxValue)]
        public virtual string? ErrorMessage { get; set; }

        /// <summary>
        /// Status of the execution
        /// </summary>
        public virtual ExecutionStatus Status { get; set; }


        /// <summary>
        /// Parent execution of the current one. Is used for execution retries
        /// </summary>
        public virtual ScheduledJobExecution? ParentExecution { get; set; }

        /// <summary>
        /// This is a JSON string containing the job stats.
        /// </summary>
        public virtual ScheduledJobStatistic? JobStatistics { get; set; }
    }
}
