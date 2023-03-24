using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.DynamicEntities.Dtos;
using Shesha.Scheduler.Domain;
using System;

namespace Shesha.Scheduler.Services.ScheduledJobs
{
    /// <summary>
    /// Scheduled Job Trigger application service
    /// </summary>
    public class ScheduledJobTriggerAppService : DynamicCrudAppService<ScheduledJobTrigger, DynamicDto<ScheduledJobTrigger, Guid>, Guid>, ITransientDependency
    {
        /// <summary>
        /// Default constructor
        /// </summary>
        /// <param name="repository"></param>
        public ScheduledJobTriggerAppService(IRepository<ScheduledJobTrigger, Guid> repository) : base(repository)
        {
        }
    }
}
