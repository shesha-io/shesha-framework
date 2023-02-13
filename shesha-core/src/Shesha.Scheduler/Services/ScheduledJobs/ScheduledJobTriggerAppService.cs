using Abp.Application.Services.Dto;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Microsoft.AspNetCore.Mvc;
using Shesha.Scheduler.Domain;
using Shesha.Scheduler.Services.ScheduledJobs.Dto;
using System;
using System.Threading.Tasks;

namespace Shesha.Scheduler.Services.ScheduledJobs
{
    /// <summary>
    /// Scheduled Job Trigger application service
    /// </summary>
    public class ScheduledJobTriggerAppService : SheshaCrudServiceBase<ScheduledJobTrigger, ScheduledJobTriggerDto, Guid>, ITransientDependency
    {
        private readonly IScheduledJobManager _jobManager;

        /// <summary>
        /// Default constructor
        /// </summary>
        /// <param name="repository"></param>
        /// <param name="jobManager"></param>
        public ScheduledJobTriggerAppService(IRepository<ScheduledJobTrigger, Guid> repository, IScheduledJobManager jobManager) : base(repository)
        {
            _jobManager = jobManager;
        }

        /// inheritedDoc
        public override async Task<ScheduledJobTriggerDto> CreateAsync(ScheduledJobTriggerDto input)
        {
            var result = await base.CreateAsync(input);

            await UnitOfWorkManager.Current.SaveChangesAsync();

            // sync with Hangfire
            await _jobManager.EnqueueAllAsync();

            return result;
        }

        /// inheritedDoc
        public override async Task<ScheduledJobTriggerDto> UpdateAsync(ScheduledJobTriggerDto input)
        {
            var result = await base.UpdateAsync(input);

            await UnitOfWorkManager.Current.SaveChangesAsync();

            // sync with Hangfire
            await _jobManager.EnqueueAllAsync();

            return result;
        }

        /// inheritedDoc
        [HttpDelete]
        public override async Task DeleteAsync(EntityDto<Guid> input)
        {
            await base.DeleteAsync(input);

            await UnitOfWorkManager.Current.SaveChangesAsync();

            // sync with Hangfire
            await _jobManager.EnqueueAllAsync();
        }
    }
}
