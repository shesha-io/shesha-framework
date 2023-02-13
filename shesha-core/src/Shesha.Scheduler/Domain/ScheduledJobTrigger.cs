using System;
using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.Scheduler.Domain.Enums;

namespace Shesha.Scheduler.Domain
{
    [Entity(FriendlyName = "Scheduled Job Trigger")]
    public class ScheduledJobTrigger : FullAuditedEntity<Guid>
    {
        [StringLength(100)]
        public virtual string CronString { get; set; }

        [StringLength(1000)]
        [DataType(DataType.MultilineText)]
        public virtual string Description { get; set; }

        /// <summary>
        /// Json string to pass parameters to a scheduled job in case want to reuse the same scheduled job but different input parameters         
        /// </summary>
        [StringLength(int.MaxValue)]
        public virtual string ParametersJson { get; set; }

        /// <summary>
        /// Scheduled job
        /// </summary>
        public virtual ScheduledJob Job { get; set; }

        /// <summary>
        /// Status of the trigger (enabled/disabled)
        /// </summary>
        public virtual TriggerStatus Status { get; set; }

        #region Notifications

        /// <summary>
        /// Notification to trigger upon successful completion of the job.
        /// </summary>
        //public virtual Notification NotificationOnSuccess { get; set; }

        /// <summary>
        /// Notification to trigger upon a warning being reported by the scheduled job. 
        /// </summary>
        //public virtual Notification NotificationOnWarning { get; set; }

        /// <summary>
        /// Notification to trigger upon failure of the job.
        /// </summary>
        //public virtual Notification NotificationOnFailure { get; set; }

        #endregion

        public ScheduledJobTrigger()
        {
            Status = TriggerStatus.Enabled;
        }
    }
}
