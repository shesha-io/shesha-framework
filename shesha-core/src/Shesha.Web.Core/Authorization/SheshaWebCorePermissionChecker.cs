using System;
using System.Linq;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using NHibernate.Linq;
using Shesha.Authorization;
using Shesha.Domain;
using Shesha.Utilities;

namespace Boxfusion.Authorization
{
    /// <summary>
    /// SheshaAspnetCoreDemo Permission checker
    /// </summary>
    public class SheshaWebCorePermissionChecker : ICustomPermissionChecker, ISheshaWebCorePermissionChecker
    {
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<ShaRoleAppointedPerson, Guid> _rolePersonRepository;
        private readonly IRepository<ShaRoleAppointmentEntity, Guid> _appEntityRepository;

        /// <summary>
        /// Default constructor
        /// </summary>
        public SheshaWebCorePermissionChecker(IRepository<Person, Guid> personRepository, IRepository<ShaRoleAppointedPerson, Guid> rolePersonRepository, IRepository<ShaRoleAppointmentEntity, Guid> appEntityRepository)
        {
            _personRepository = personRepository;
            _rolePersonRepository = rolePersonRepository;
            _appEntityRepository = appEntityRepository;
        }

        /// inheritedDoc
        public async Task<bool> IsGrantedAsync(long userId, string permissionName)
        {
            var person = await _personRepository.GetAll().Where(p => p.User.Id == userId).FirstOrDefaultAsync();
            if (person == null)
                return false;

            // system administrator has all rights
            if (await IsInAnyOfRoles(person, RoleNames.SystemAdministrator))
                return true;

            // add custom permission checks here...
            
            return false;
        }

        /// inheritedDoc
        public async Task<bool> IsInAnyOfRoles(Person person, params string[] roles)
        {
            return await _rolePersonRepository.GetAll()
                .Where(e => roles.Contains(e.Role.Name) && e.Person == person).AnyAsync();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="person"></param>
        /// <returns></returns>
        public async Task<bool> IsDataAdministrator(Person person)
        {
            return await IsInAnyOfRoles(person, RoleNames.SystemAdministrator);
        }

        public bool IsGranted(long userId, string permissionName)
        {
            return AsyncHelper.RunSync(() => IsGrantedAsync(userId, permissionName));
        }
    }
}
