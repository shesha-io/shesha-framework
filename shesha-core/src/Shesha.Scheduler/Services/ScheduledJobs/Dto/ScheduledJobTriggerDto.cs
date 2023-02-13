using System;
using System.ComponentModel.DataAnnotations;
using Abp.Application.Services.Dto;
using Abp.Runtime.Validation;
using Shesha.AutoMapper.Dto;
using Shesha.Scheduler.Utilities;

namespace Shesha.Scheduler.Services.ScheduledJobs.Dto
{
    public class ScheduledJobTriggerDto : EntityDto<Guid>, ICustomValidate
    {
        public string CronString { get; set; }

        public string Description { get; set; }

        /// <summary>
        /// Json string to pass parameters to a scheduled job in case want to reuse the same scheduled job but different input parameters         
        /// </summary>
        public string ParametersJson { get; set; }

        public EntityReferenceDto<Guid?> Job { get; set; }

        public ReferenceListItemValueDto Status { get; set; }
        public void AddValidationErrors(CustomValidationContext context)
        {
            if (!string.IsNullOrWhiteSpace(CronString) && !CronStringHelper.IsValidCronExpression(CronString))
            {
                context.Results.Add(new ValidationResult("CRON String is invalid"));
            }
        }
    }
}
