using Abp.Domain.Repositories;
using Abp.Threading;
using Shesha.Authorization;
using Shesha.Authorization.Roles;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.Extensions;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Boxfusion.Authorization
{
    /// <summary>
    /// SheshaAspnetCoreDemo Permission checker
    /// </summary>
    public class SheshaWebCorePermissionChecker : ICustomPermissionChecker, ISheshaWebCorePermissionChecker
    {
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<ShaRoleAppointedPerson, Guid> _rolePersonRepository;

        /// <summary>
        /// Default constructor
        /// </summary>
        public SheshaWebCorePermissionChecker(IRepository<Person, Guid> personRepository, IRepository<ShaRoleAppointedPerson, Guid> rolePersonRepository)
        {
            _personRepository = personRepository;
            _rolePersonRepository = rolePersonRepository;
        }

        /// inheritedDoc
        public async Task<bool> IsGrantedAsync(long userId, string permissionName)
        {
            var person = await _personRepository.FirstOrDefaultAsync(p => p.User.Id == userId);
            if (person == null)
                return false;

            // system administrator has all rights
            if (await IsInAnyOfRolesAsync(person, StaticRoleNames.SystemAdministrator))
                return true;

            // add custom permission checks here...
            
            return false;
        }

        /// inheritedDoc
        public async Task<bool> IsInAnyOfRolesAsync(Person person, params string[] roles)
        {
            return await _rolePersonRepository.GetAll()
                .Where(e => roles.Contains(e.Role.Name) && e.Person == person)
                .AnyAsync();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="person"></param>
        /// <returns></returns>
        public async Task<bool> IsDataAdministratorAsync(Person person)
        {
            return await IsInAnyOfRolesAsync(person, StaticRoleNames.SystemAdministrator);
        }

        public bool IsGranted(long userId, string permissionName)
        {
            return AsyncHelper.RunSync(() => IsGrantedAsync(userId, permissionName));
        }

        public async Task<bool> IsGrantedAsync(long userId, string permissionName, EntityReferenceDto<string> permissionedEntity)
        {
            return await IsGrantedAsync(userId, permissionName);
        }

        public bool IsGranted(long userId, string permissionName, EntityReferenceDto<string> permissionedEntity)
        {
            return IsGranted(userId, permissionName);
        }
    }
}
