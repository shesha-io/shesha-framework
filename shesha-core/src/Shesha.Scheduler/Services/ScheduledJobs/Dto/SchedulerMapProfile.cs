using System;
using Shesha.AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Extensions;
using Shesha.Scheduler.Domain;

namespace Shesha.Scheduler.Services.ScheduledJobs.Dto
{
    public class SchedulerMapProfile: ShaProfile
    {
        public SchedulerMapProfile()
        {
            CreateMap<ScheduledJob, ScheduledJobDto>()
                .MapReferenceListValuesToDto();

            CreateMap<ScheduledJobDto, ScheduledJob>()
                .MapReferenceListValuesFromDto();


            CreateMap<ScheduledJobTrigger, ScheduledJobTriggerDto>()
                .ForMember(u => u.Job,
                    options => options.MapFrom(e => e.Job != null ? new EntityReferenceDto<Guid?>(e.Job.Id, e.Job.JobName, e.Job.GetClassName()) : null))
                .MapReferenceListValuesToDto();

            CreateMap<ScheduledJobTriggerDto, ScheduledJobTrigger>()
                .ForMember(u => u.Job,
                    options => options.MapFrom(e =>
                        e.Job != null && e.Job.Id != null
                            ? GetEntity<ScheduledJob, Guid>(e.Job.Id.Value)
                            : null))
                .MapReferenceListValuesFromDto();

            #region executions

            CreateMap<ScheduledJobExecution, ScheduledJobExecutionDto>()
                .ForMember(u => u.StartedBy,
                    options => options.MapFrom(e => e.StartedBy != null ? new EntityReferenceDto<Int64?>(e.StartedBy.Id, e.StartedBy.UserName, e.StartedBy.GetClassName()) : null))
                .ForMember(u => u.Job,
                    options => options.MapFrom(e => e.Job != null ? new EntityReferenceDto<Guid?>(e.Job.Id, e.Job.JobName, e.Job.GetClassName()) : null))
                .ForMember(u => u.Trigger,
                    options => options.MapFrom(e => e.Trigger != null ? new EntityReferenceDto<Guid?>(e.Trigger.Id, e.Trigger.CronString, e.Trigger.GetClassName()) : null))
                //.ForMember(u => u.JobStatistics,
                //    options => options.MapFrom(e => e.JobStatistics != null ? e.JobStatistics.GetJson() : null))
                .MapReferenceListValuesToDto();

            #endregion
        }
    }
}
