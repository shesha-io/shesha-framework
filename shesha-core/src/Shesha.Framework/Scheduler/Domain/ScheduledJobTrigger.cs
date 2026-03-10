using Abp.Domain.Entities.Auditing;
using Abp.Domain.Repositories;
using FluentValidation;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Scheduler.Domain.Enums;
using Shesha.Scheduler.Utilities;
using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;
using Shesha.Extensions;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Scheduler.Domain
{
    [Entity(FriendlyName = "Scheduled Job Trigger")]
    [Table("Core_ScheduledJobTriggers")]
    public class ScheduledJobTrigger : FullAuditedEntity<Guid>
    {
        [MaxLength(100)]
        public virtual string CronString { get; set; }

        [MaxLength(1000)]
        [DataType(DataType.MultilineText)]
        public virtual string Description { get; set; }

        /// <summary>
        /// Json string to pass parameters to a scheduled job in case want to reuse the same scheduled job but different input parameters         
        /// </summary>
        [MaxLength(int.MaxValue)]
        public virtual string ParametersJson { get; set; }

        /// <summary>
        /// Scheduled job
        /// </summary>
        public virtual ScheduledJob Job { get; set; }

        /// <summary>
        /// Status of the trigger (enabled/disabled)
        /// </summary>
        public virtual TriggerStatus Status { get; set; }

        public ScheduledJobTrigger()
        {
            Status = TriggerStatus.Enabled;
        }
    }

    public class ScheduledJobTriggerValidator : AbstractValidator<ScheduledJobTrigger>
    {
        private readonly IRepository<ScheduledJobTrigger, Guid> _repository;

        public ScheduledJobTriggerValidator(IRepository<ScheduledJobTrigger, Guid> repository)
        {
            _repository = repository;
            RuleFor(x => x.Job).NotEmpty();
            RuleFor(x => x.CronString).Must(cron => !string.IsNullOrWhiteSpace(cron) && CronStringHelper.IsValidCronExpression(cron)).WithMessage("CRON String is invalid.");
            RuleFor(x => x.CronString).MustAsync(UniqueCronStringAsync).WithMessage("Trigger with the same CRON String already exists.");
        }

        private async Task<bool> UniqueCronStringAsync(ScheduledJobTrigger trigger, string cronString, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(cronString))
                return true;

            var alreadyExist = await _repository.GetAll().Where(m => m.Job == trigger.Job && m.CronString == cronString && m.Id != trigger.Id).AnyAsync();
            return !alreadyExist;
        }
    }
}
