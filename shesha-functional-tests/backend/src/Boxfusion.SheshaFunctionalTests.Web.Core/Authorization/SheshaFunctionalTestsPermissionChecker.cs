using Abp.Domain.Repositories;
using Abp.Threading;
using NHibernate.Linq;
using Shesha.Authorization;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Authorization
{
    /// <summary>
    /// SheshaFunctionalTests Permission checker
    /// </summary>
    public class SheshaFunctionalTestsPermissionChecker : ICustomPermissionChecker, ISheshaFunctionalTestsPermissionChecker
    {
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<ShaRoleAppointedPerson, Guid> _rolePersonRepository;

        /// <summary>
        /// Default constructor
        /// </summary>
        public SheshaFunctionalTestsPermissionChecker(IRepository<Person, Guid> personRepository, IRepository<ShaRoleAppointedPerson, Guid> rolePersonRepository)
        {
            _personRepository = personRepository;
            _rolePersonRepository = rolePersonRepository;
        }

        /// <summary>
        /// inheritedDoc
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="permissionName"></param>
        /// <returns></returns>
        public async Task<bool> IsGrantedAsync(long userId, string permissionName)
        {
            var person = await _personRepository.GetAll().Where(p => p.User != null && p.User.Id == userId).FirstOrDefaultAsync();
            if (person == null)
                return false;

            if (person.User?.UserName.ToLower() == "admin")
                return true;

            switch (permissionName)
            {
                default:
                    return false;
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="permissionName"></param>
        /// <returns></returns>
        public bool IsGranted(long userId, string permissionName)
        {
            return AsyncHelper.RunSync(async () => await IsGrantedAsync(userId, permissionName));
        }

        /// <summary>
        /// inheritedDoc
        /// </summary>
        /// <param name="person"></param>
        /// <param name="roles"></param>
        /// <returns></returns>
        public async Task<bool> IsInAnyOfRolesAsync(Person person, params string[] roles)
        {
            return await _rolePersonRepository.GetAll()
                .Where(e => roles.Contains(e.Role.Name) && e.Person == person).AnyAsync();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="person"></param>
        /// <returns></returns>
        public async Task<bool> IsDataAdministratorAsync(Person person)
        {
            return await IsInAnyOfRolesAsync(person, CommonRoles.DataAdministrator);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="person"></param>
        /// <returns></returns>
        public async Task<bool> IsAdminAsync(Person person)
        {
            return await IsInAnyOfRolesAsync(person, CommonRoles.SystemAdministrator);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="person"></param>
        /// <returns></returns>
        public async Task<bool> IsGlobalAdminAsync(Person person)
        {
            return await IsInAnyOfRolesAsync(person, CommonRoles.GlobalAdmin);
        }

        public async Task<bool> IsGrantedAsync(long userId, string permissionName, EntityReferenceDto<string> permissionedEntity)
        {
            return await Task.FromResult(false);
        }

        public bool IsGranted(long userId, string permissionName, EntityReferenceDto<string> permissionedEntity)
        {
            return false;
        }
    }
}