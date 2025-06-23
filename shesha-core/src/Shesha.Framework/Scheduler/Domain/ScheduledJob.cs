using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.Scheduler.Domain.Enums;

namespace Shesha.Scheduler.Domain
{
    [Entity(TypeShortAlias = "Shesha.Scheduler.ScheduledJob")]
    [Table("Core_ScheduledJobs")]
    public class ScheduledJob: FullAuditedEntity<Guid>
    {
        /// <summary>
        /// Name of the scheduled job
        /// </summary>
        [EntityDisplayName]
        [StringLength(300, MinimumLength = 3)]
        public virtual string JobName { get; set; }

        /// <summary>
        /// Namespace
        /// </summary>
        [StringLength(300, MinimumLength = 3)]
        public virtual string? JobNamespace { get; set; }

        /// <summary>
        /// Description of the job
        /// </summary>
        [DataType(DataType.MultilineText)]
        [MaxLength(int.MaxValue)]
        public virtual string? JobDescription { get; set; }

        /// <summary>
        /// Job status (Active/Inactive). Is used to switch job on/off.
        /// </summary>
        public virtual JobStatus JobStatus { get; set; }

        /// <summary>
        /// Startup mode (Automatic/Manual)
        /// </summary>
        public virtual StartUpMode StartupMode { get; set; }

        /// <summary>
        /// Log Mode (File System/Stored File). Is used to specify whether the logs will be saved as stored files or not.
        /// </summary>
        public virtual LogMode LogMode { get; set; }

        /// <summary>
        /// Folder to store the logs
        /// </summary>
        [MaxLength(int.MaxValue)]
        public virtual string? LogFolder { get; set; }

        /// <summary>
        /// Used to specify if job class uses generic definition of ScheduledJobBase or default.
        /// </summary>
        [MaxLength(int.MaxValue)]
        public virtual string JobType { get; set; }
    }
}
