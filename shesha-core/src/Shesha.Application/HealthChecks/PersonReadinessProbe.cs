using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using NHibernate.Linq;
using Shesha.Domain;
using System;
using System.Threading.Tasks;

namespace Shesha.HealthChecks
{
    /// <summary>
    /// Runs a cheap existence query against <see cref="Person"/> through the same NHibernate
    /// session and repository the rest of the app uses.
    /// </summary>
    public class PersonReadinessProbe : IPersonReadinessProbe, ITransientDependency
    {
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IRepository<Person, Guid> _personRepository;

        public PersonReadinessProbe(IUnitOfWorkManager unitOfWorkManager, IRepository<Person, Guid> personRepository)
        {
            _unitOfWorkManager = unitOfWorkManager;
            _personRepository = personRepository;
        }

        public async Task ProbeAsync()
        {
            using var uow = _unitOfWorkManager.Begin();

            await (await _personRepository.GetAllAsync()).AnyAsync();
            await uow.CompleteAsync();
        }
    }
}
