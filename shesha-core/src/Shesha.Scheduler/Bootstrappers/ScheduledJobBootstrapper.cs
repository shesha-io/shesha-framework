using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Reflection;
using Shesha.Bootstrappers;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Scheduler.Attributes;
using Shesha.Scheduler.Domain;
using Shesha.Scheduler.Domain.Enums;
using Shesha.Scheduler.Utilities;
using Shesha.Startup;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Scheduler.Bootstrappers
{
    /// <summary>
    /// Bootstraps scheduled jobs and saves them into the DB
    /// </summary>
    public class ScheduledJobBootstrapper : IBootstrapper, ITransientDependency
    {
        private readonly ITypeFinder _typeFinder;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IRepository<ScheduledJob, Guid> _jobRepo;
        private readonly IRepository<ScheduledJobTrigger, Guid> _triggerRepo;
        private readonly IScheduledJobManager _jobManager;
        private readonly IApplicationStartupSession _startupSession;

        public ScheduledJobBootstrapper
        (
            ITypeFinder typeFinder,
            IUnitOfWorkManager unitOfWorkManager,
            IRepository<ScheduledJob, Guid> jobRepo,
            IRepository<ScheduledJobTrigger, Guid> triggerRepo,
            IScheduledJobManager jobManager,
            IApplicationStartupSession startupSession
        )
        {
            _typeFinder = typeFinder;
            _unitOfWorkManager = unitOfWorkManager;
            _jobRepo = jobRepo;
            _triggerRepo = triggerRepo;
            _jobManager = jobManager;
            _startupSession = startupSession;
        }

        public async Task ProcessAsync()
        {
            using (var unitOfWork = _unitOfWorkManager.Begin())
            {
                await DoProcessAsync();
                await unitOfWork.CompleteAsync();
            }
        }

        private async Task DoProcessAsync()
        {
            var jobs = _typeFinder
                .Find(type => type != null && type.IsPublic && type.HasAttribute<ScheduledJobAttribute>())
                .Select(e => new
                {
                    Class = e,
                    Attribute = e.GetAttribute<ScheduledJobAttribute>()
                })                
                .ToList();

            // deactivate all jobs which are missing in the code
            var dbItems = await _jobRepo.GetAll().ToListAsync();
            var toDelete = dbItems.Where(i => !jobs.Any(j => j.Attribute.Uid == i.Id)).ToList();
            foreach (var scheduledJob in toDelete)
            {
                await _jobRepo.DeleteAsync(scheduledJob);
            }

            if (!jobs.Any())
                return;

            foreach (var jobInfo in jobs)
            {
                try
                {
                    using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
                    {
                        var existingJob = await _jobRepo.FirstOrDefaultAsync(j => j.Id == jobInfo.Attribute.Uid);

                        // job already exists - activate  if inactive it and continue processing
                        // note: the user can't create/delete jobs manually, so we assume that the job was inactivated by this bootstrapper
                        if (existingJob != null)
                        {
                            if (existingJob.IsDeleted)
                            {
                                existingJob.IsDeleted = false;
                                existingJob.DeletionTime = null;
                                existingJob.DeleterUserId = null;
                                await _jobRepo.UpdateAsync(existingJob);
                            }

                            continue;
                        }
                    }

                    // create job and default trigger only if the job is missing in the DB
                    var job = new ScheduledJob()
                    {
                        Id = jobInfo.Attribute.Uid,
                        JobName = jobInfo.Class.Name,
                        JobNamespace = jobInfo.Class.Namespace,
                        StartupMode = jobInfo.Attribute.StartupMode,
                        JobStatus = JobStatus.Active,
                        JobDescription = jobInfo.Attribute.Description,
                        LogMode = jobInfo.Attribute.LogMode,
                        LogFolder = jobInfo.Attribute.LogFolder,
                        JobType = jobInfo.Class.GetRequiredFullName()
                    };

                    await _jobRepo.InsertAsync(job);

                    // create a trigger
                    if (jobInfo.Attribute.StartupMode == StartUpMode.Automatic &&
                        !string.IsNullOrWhiteSpace(jobInfo.Attribute.CronString) &&
                        CronStringHelper.IsValidCronExpression(jobInfo.Attribute.CronString))
                    {
                        var trigger = new ScheduledJobTrigger()
                        {
                            Job = job,
                            Description = "Default trigger (created automatically)",
                            CronString = jobInfo.Attribute.CronString
                        };

                        await _triggerRepo.InsertAsync(trigger);
                    }

                    await _unitOfWorkManager.Current.SaveChangesAsync();
                }
                catch (Exception e)
                {
                    throw new Exception($"An error occured during bootstrapping of the scheduled job {jobInfo.Attribute.Uid}", e);
                }
            }

            // sync to Hangfire
            await _jobManager.EnqueueAllAsync();
        }
    }
}