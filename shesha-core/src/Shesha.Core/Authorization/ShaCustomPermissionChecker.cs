using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Threading;
using Shesha.AutoMapper.Dto;
using Shesha.ConfigurationItems.Exceptions;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Roles;
using System;
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

        public async Task<bool> IsGrantedAsync(long userId, string permissionName)
        {
            var person = await GetPersonAsync(userId);
            if (person == null)
                return false;

            // TODO: add caching
            var roles = await (await GetPersonGrantsAsync(person, permissionName))
                .Select(e => e.Role)
                .Distinct()
                .ToListAsync();

            foreach (var role in roles) 
            {
                var resolvedRole = await ResolveRoleAsync(role);
                if (resolvedRole == role)
                    return true;
            }
            return false;
        }

        private async Task<IQueryable<ShaRoleAppointedPerson>> GetPersonGrantsAsync(Person person, string permissionName) 
        {
            return (await _rolePersonRepository.GetAllAsync()).Where(x => x.Person == person && !x.Role.IsDeleted && x.Role.Permissions.Any(rp => rp.Permission == permissionName && rp.IsGranted));
        }

        public async Task<bool> IsGrantedAsync(long userId, string permissionName, EntityReferenceDto<string> permissionedEntity)
        {
            var person = await GetPersonAsync(userId);
            if (person == null)
                return false;

            var grants = await (await GetPersonGrantsAsync(person, permissionName)).ToListAsync();
            foreach (var grant in grants) 
            {
                if (!grant.PermissionedEntities.Any() || grant.PermissionedEntities.Any(pe => pe.Id == permissionedEntity.Id && pe._className == permissionedEntity._className)) 
                {
                    var resolvedRole = await ResolveRoleAsync(grant.Role);
                    if (resolvedRole == grant.Role)
                        return true;
                }
            }
            return false;
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