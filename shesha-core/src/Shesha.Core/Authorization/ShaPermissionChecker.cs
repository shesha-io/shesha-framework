using System;
using System.Linq;
using System.Threading.Tasks;
using Abp.Dependency;
using Abp.Domain.Repositories;
using NHibernate.Linq;
using Shesha.Domain;

namespace Shesha.Authorization
{
    public class ShaPermissionChecker : ICustomPermissionChecker, ITransientDependency
    {
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<ShaRoleAppointedPerson, Guid> _rolePersonRepository;

        /// <summary>
        /// Default constructor
        /// </summary>
        public ShaPermissionChecker(IRepository<Person, Guid> personRepository, IRepository<ShaRoleAppointedPerson, Guid> rolePersonRepository, IRepository<ShaRoleAppointmentEntity, Guid> appEntityRepository)
        {
            _personRepository = personRepository;
            _rolePersonRepository = rolePersonRepository;
        }

        public async Task<bool> IsGrantedAsync(long userId, string permissionName)
        {
            var person = await _personRepository.GetAll().FirstOrDefaultAsync(x => x.User.Id == userId);
            var roles = _rolePersonRepository.GetAll().Where(x => x.Person == person);
            return roles.SelectMany(x => x.Role.Permissions).Any(x => x.Permission == permissionName && x.IsGranted);
        }

        public bool IsGranted(long userId, string permissionName)
        {
            var person = _personRepository.GetAll().FirstOrDefault(x => x.User.Id == userId);
            var roles = _rolePersonRepository.GetAll().Where(x => x.Person == person);
            return roles.SelectMany(x => x.Role.Permissions).Any(x => x.Permission == permissionName && x.IsGranted);
        }
    }
}