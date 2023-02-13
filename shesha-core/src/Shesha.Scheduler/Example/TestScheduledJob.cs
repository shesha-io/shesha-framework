using System;
using System.Linq;
using System.Threading;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Microsoft.AspNetCore.SignalR;
using Shesha.Domain;
using Shesha.Scheduler.Attributes;
using Shesha.Scheduler.Domain;
using Shesha.Scheduler.Domain.Enums;
using Shesha.Scheduler.SignalR;
using Shesha.Services;

namespace Shesha.Scheduler.Example
{
    [ScheduledJob("8ADAEEAD-F97B-43BF-B511-6F13C2BDFB3F", StartUpMode.Automatic, cronString: "0/10 * * * ?")]
    public class TestScheduledJob: ScheduledJobBase, ITransientDependency
    {
        private readonly IRepository<Person, Guid> _employeeRepository;

        public TestScheduledJob(IRepository<ScheduledJob, Guid> jobRepository, IRepository<ScheduledJobTrigger, Guid> triggerRepository, IRepository<ScheduledJobExecution, Guid> jobExecutionRepository, IStoredFileService fileService, IHubContext<SignalrAppenderHub> hubContext, IUnitOfWorkManager unitOfWorkManager, IRepository<Person, Guid> employeeRepository) : base(jobRepository, triggerRepository, jobExecutionRepository, fileService, hubContext, unitOfWorkManager)
        {
            _employeeRepository = employeeRepository;
        }

        [UnitOfWork]
        public override void DoExecute()
        {
            var employees = _employeeRepository.GetAll().ToList();
            foreach (var person in employees)
            {
                Log.Info($"process user {person.FullName}");
                Thread.Sleep(100);
            }
        }
    }
}
