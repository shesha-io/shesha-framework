using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Threading;
using Shesha.AutoMapper.Dto;
using Shesha.ConfigurationItems.Exceptions;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Roles;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Authorization
{
    public class ShaCustomPermissionChecker : ICustomPermissionChecker, ITransientDependency
    {
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<ShaRoleAppointedPerson, Guid> _rolePersonRepository;
        private readonly IShaRoleManager _roleManager;

        /// <summary>
        /// Default constructor
        /// </summary>
        public ShaCustomPermissionChecker(
            IRepository<Person, Guid> personRepository,
            IRepository<ShaRoleAppointedPerson, Guid> rolePersonRepository,
            IShaRoleManager roleManager)
        {
            _personRepository = personRepository;
            _rolePersonRepository = rolePersonRepository;
            _roleManager = roleManager;
        }

        /// <summary>Resolves a role to its top-module override; module-less roles are used as-is.</summary>
        private async Task<ShaRole> ResolveRoleAsync(ShaRole role)
        {
            if (role.Module == null)
                return role;

            try
            {
                return (ShaRole)await _roleManager.ResolveItemAsync(role.Module.Name, role.Name, null);
            }
            catch (ConfigurationItemNotFoundException)
            {
                return role;
            }
        }

        private async Task<List<ShaRole>> ResolveRolesAsync(IEnumerable<ShaRole> roles)
        {
            var resolved = new List<ShaRole>();
            foreach (var role in roles.Distinct())
            {
                var resolvedRole = await ResolveRoleAsync(role);
                if (resolved.All(r => r.Id != resolvedRole.Id))
                    resolved.Add(resolvedRole);
            }
            return resolved;
        }

        public async Task<bool> IsGrantedAsync(long userId, string permissionName)
        {
            var person = await GetPersonAsync(userId);
            if (person == null)
                return false;

            // TODO: add caching
            var roles = await (await _rolePersonRepository.GetAllAsync()).Where(x => x.Person == person).Select(e => e.Role).ToListAsync();
            var resolvedRoles = await ResolveRolesAsync(roles);
            return resolvedRoles.Any(r => r.Permissions.Any(x => x.Permission == permissionName && x.IsGranted));
        }

        public async Task<bool> IsGrantedAsync(long userId, string permissionName, EntityReferenceDto<string> permissionedEntity)
        {
            var person = await GetPersonAsync(userId);
            if (person == null)
                return false;

            var appointments = (await _rolePersonRepository.GetAllListAsync(x => x.Person == person))
                .Where(x =>
                    !x.PermissionedEntities.Any()
                    || x.PermissionedEntities.Any(pe => pe.Id == permissionedEntity.Id && pe._className == permissionedEntity._className));

            var resolvedRoles = await ResolveRolesAsync(appointments.Select(e => e.Role));
            var permissions = resolvedRoles.SelectMany(e => e.Permissions).ToList();

            return permissions.Any(x => x.Permission == permissionName && x.IsGranted);
        }

        public bool IsGranted(long userId, string permissionName)
        {
            return AsyncHelper.RunSync(async() => await IsGrantedAsync(userId, permissionName));
        }


        public bool IsGranted(long userId, string permissionName, EntityReferenceDto<string> permissionedEntity)
        {
            return AsyncHelper.RunSync(async () => await IsGrantedAsync(userId, permissionName, permissionedEntity));
        }

        private Task<Person> GetPersonAsync(long userId)
        {
            return _personRepository.FirstOrDefaultAsync(x => x.User != null && x.User.Id == userId);
        }
    }
}