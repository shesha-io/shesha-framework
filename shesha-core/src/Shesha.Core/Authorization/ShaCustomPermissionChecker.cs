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
        public ShaCustomPermissionChecker(IRepository<Person, Guid> personRepository, IRepository<ShaRoleAppointedPerson, Guid> rolePersonRepository)
        {
            _personRepository = personRepository;
            _rolePersonRepository = rolePersonRepository;
        }

        public async Task<bool> IsGrantedAsync(long userId, string permissionName)
        {
            var person = await GetPersonAsync(userId);
            if (person == null)
                return false;
            
            // TODO: add caching
            var roles = await _rolePersonRepository.GetAll().Where(x => x.Person == person).Select(e => e.Role).ToListAsync();
            return roles.Any(r => r.Permissions.Any(x => x.Permission == permissionName && x.IsGranted));
        }

        public async Task<bool> IsGrantedAsync(long userId, string permissionName, EntityReferenceDto<string> permissionedEntity)
        {
            var person = await GetPersonAsync(userId);
            if (person == null)
                return false;

            
            
            var appointments = (await _rolePersonRepository.GetAll().Where(x => x.Person == person)
                .ToListAsync())
                .Where(x =>
                    !x.PermissionedEntities.Any()
                    || x.PermissionedEntities.Any(pe => pe.Id == permissionedEntity.Id && pe._className == permissionedEntity._className));

            var permissions = appointments.Select(e => e.Role)
                .SelectMany(e => e.Permissions)
                .ToList();

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