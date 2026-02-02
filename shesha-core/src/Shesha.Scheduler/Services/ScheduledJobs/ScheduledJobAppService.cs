using Abp.Dependency;
using Abp.Domain.Repositories;
using Microsoft.AspNetCore.Mvc;
using Shesha.Authorization.Users;
using Shesha.DynamicEntities.Dtos;
using Shesha.Scheduler.Bootstrappers;
using Shesha.Scheduler.Domain;
using Shesha.Scheduler.Services.ScheduledJobs.Dto;
using System;
using System.Threading.Tasks;

namespace Shesha.Scheduler.Services.ScheduledJobs
{
    /// <summary>
    /// Scheduled Job application service
    /// </summary>
    public class ScheduledJobAppService : DynamicCrudAppService<ScheduledJob, DynamicDto<ScheduledJob, Guid>, Guid>, ITransientDependency
    {
        private readonly IScheduledJobManager _jobManager;
        private readonly IScheduledJobRunner _jobRunner;
        private readonly IRepository<ScheduledJob, Guid> _jobRepo;

        public IRepository<User, Int64> UserRepository { get; set; }

        /// <summary>
        /// Default constructor
        /// </summary>
        public ScheduledJobAppService(IRepository<ScheduledJob, Guid> repository, IScheduledJobManager jobManager, IScheduledJobRunner jobRunner, IRepository<ScheduledJob, Guid> jobRepo) : base(repository)
        {
            _jobManager = jobManager;
            _jobRunner = jobRunner;
            _jobRepo = jobRepo;
        }

        /// <summary>
        /// Enqeue scheduled job
        /// </summary>
        [HttpPost]
        public async Task<StartJobResponse> StartJobAsync(StartJobInput input)
        {
            var id = input.JobId;

            // note: special code fore manual jobs
            var scheduledJob = await _jobRepo.FirstOrDefaultAsync(j => j.Id == id);

            if (scheduledJob == null)
                throw new Exception("Job with the specified Id not found");

            var job = _jobRunner.GetJobInstanceById(id);

            var executionId = Guid.NewGuid();

            await _jobManager.EnqeueJobAsync(id, executionId, AbpSession.UserId);

            return new StartJobResponse(executionId);
        }

        /// <summary>
        /// Enqeue scheduled job trigger
        /// </summary>
        /// <param name="triggerId">Trigger Id</param>
        /// <returns></returns>
        public async Task RunTriggerAsync(Guid triggerId)
        {
            await _jobManager.EnqeueJobTriggerAsync(triggerId);
        }

        /// <summary>
        /// Enqueue all jobs using Hangfire
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public async Task EnqueueAllAsync()
        {
            await _jobManager.EnqueueAllAsync();
        }

        /// <summary>
        /// Bootstraps all scheduled jobs and default CRON triggers
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public async Task<string> BootstrapScheduledJobsAsync(bool force)
        {
            var bootstrapper = IocManager.Resolve<ScheduledJobBootstrapper>();
            await bootstrapper.ProcessAsync(force);
            return "Bootstrapped successfully";
        }
    }
}
