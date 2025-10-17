using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Threading;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.Extensions;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Authorization
{
    public class ShaCustomPermissionChecker : ICustomPermissionChecker, ITransientDependency
    {
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<ShaRoleAppointedPerson, Guid> _rolePersonRepository;

        /// <summary>
        /// Default constructor
        /// </summary>
        public ShaCustomPermissionChecker(IRepository<Person, Guid> personRepository, IRepository<ShaRoleAppointedPerson, Guid> rolePersonRepository, IRepository<ShaRoleAppointmentEntity, Guid> appEntityRepository)
        {
            _personRepository = personRepository;
            _rolePersonRepository = rolePersonRepository;
        }

        public async Task<bool> IsGrantedAsync(long userId, string permissionName)
        {
            var person = await GetPersonAsync(userId);
            if (person == null)
                return false;
            var roles = _rolePersonRepository.GetAll().Where(x => x.Person == person && x.Role != null);
            return roles.SelectMany(x => x.Role!.Permissions).Any(x => x.Permission == permissionName && x.IsGranted);
        }

        public async Task<bool> IsGrantedAsync(long userId, string permissionName, EntityReferenceDto<string> permissionedEntity)
        {
            var person = await GetPersonAsync(userId);
            if (person == null)
                return false;

            var roles = (await _rolePersonRepository.GetAll().Where(x => x.Person == person && x.Role != null)
                .ToListAsync())
                .Where(x =>
                {
                    // If no PermissionedEntities are defined, grant permission globally
                    if (!x.PermissionedEntities.Any())
                        return true;

                    // If entity context is not provided but role has PermissionedEntities,
                    // fall back to basic permission checking without entity constraints
                    if (permissionedEntity == null)
                        return true;

                    // Check if the specific entity matches any of the PermissionedEntities
                    return x.PermissionedEntities.Any(pe => pe.Id == permissionedEntity.Id && pe._className == permissionedEntity._className);
                });
            return roles.SelectMany(x => x.Role.Permissions).Any(x => x.Permission == permissionName && x.IsGranted);
        }

        public bool IsGranted(long userId, string permissionName)
        {
            return AsyncHelper.RunSync(async() => await IsGrantedAsync(userId, permissionName));
        }


        public bool IsGranted(long userId, string permissionName, EntityReferenceDto<string> permissionedEntity)
        {
            var person = _personRepository.GetAll().FirstOrDefault(x => x.User.Id == userId);
            var roles = _rolePersonRepository.GetAll().Where(x => x.Person == person)
                .ToList()
                .Where(x =>
                {
                    // If no PermissionedEntities are defined, grant permission globally
                    if (!x.PermissionedEntities.Any())
                        return true;

                    // If entity context is not provided but role has PermissionedEntities,
                    // fall back to basic permission checking without entity constraints
                    if (permissionedEntity == null)
                        return true;

                    // Check if the specific entity matches any of the PermissionedEntities
                    return x.PermissionedEntities.Any(pe => pe.Id == permissionedEntity.Id && pe._className == permissionedEntity._className);
                });
            return roles.SelectMany(x => x.Role.Permissions).Any(x => x.Permission == permissionName && x.IsGranted);
        }
    }
}