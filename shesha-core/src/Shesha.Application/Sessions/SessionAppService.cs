using Abp.Auditing;
using Abp.Domain.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shesha.Authorization;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.DynamicEntities.ErrorHandler;
using Shesha.Extensions;
using Shesha.Sessions.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Sessions
{
    public class SessionAppService : SheshaAppServiceBase, ISessionAppService
    {
        private readonly IRepository<ShaRoleAppointedPerson, Guid> _roleAppointmentRepository;
        private readonly IShaPermissionChecker _permissionChecker;
        private readonly IDynamicEntitiesErrorHandler _dynamicEntitiesErrorHandler;

        public IHomePageRouter HomePageRouter { get; set; } = new NullHomePageRouter();

        public SessionAppService(
            IRepository<ShaRoleAppointedPerson, Guid> roleAppointmentRepository,
            IShaPermissionChecker permissionChecker,
            IDynamicEntitiesErrorHandler dynamicEntitiesErrorHandler
        )
        {
            _roleAppointmentRepository = roleAppointmentRepository;
            _permissionChecker = permissionChecker;
            _dynamicEntitiesErrorHandler = dynamicEntitiesErrorHandler;
        }

        [AllowAnonymous]
        public async Task<GetCurrentLoginInfoOutput> GetCurrentLoginInfoAsync()
        {
            var output = new GetCurrentLoginInfoOutput();

            if (AbpSession.TenantId.HasValue)
            {
                output.Tenant = ObjectMapper.Map<TenantLoginInfoDto>(await GetCurrentTenantAsync());
            }

            if (AbpSession.UserId.HasValue)
            {
                var user = await GetCurrentUserAsync();
                var person = await GetCurrentPersonAsync();

                string homeUrl = await HomePageRouter.GetHomePageUrlAsync(user);

                output.User = new UserLoginInfoDto
                {
                    Id = user.Id,
                    AccountFound = true,
                    UserName = user.UserName,
                    FirstName = user.Name,
                    LastName = user.Surname,
                    FullName = user.FullName,
                    Email = user.EmailAddress,
                    MobileNumber = user.PhoneNumber,
                    GrantedPermissions = await GetGrantedPermissionsAsync(),
                    PersonId = person.Id,
                    HomeUrl = homeUrl
                };

                // Send initialization errors only for Application Configurators
                if (await _permissionChecker.IsGrantedAsync(ShaPermissionNames.Application_Configurator))
                    output.InitializationErrors = new InitializationErrorsInfoDto()
                    {
                        LastInitialization = _dynamicEntitiesErrorHandler.LastComplete,
                        Errors = _dynamicEntitiesErrorHandler.Exceptions.Select(x => x.Message).ToList(),
                    };
            }

            return output;
        }

        private async Task<List<GrantedPermissionDto>> GetGrantedPermissionsAsync()
        {
            var grantedPermissions = new List<GrantedPermissionDto>();

            if (AbpSession.UserId.HasValue)
            {
                var currentUser = await GetCurrentPersonAsync();
                if (currentUser == null)
                    return grantedPermissions;

                var roles = await _roleAppointmentRepository.GetAll().Where(a => a.Person == currentUser).ToListAsync();
                var allPermissionNames = PermissionManager.GetAllPermissions(false).Select(p => p.Name).ToList();

                foreach (var permissionName in allPermissionNames)
                {
                    if (await PermissionChecker.IsGrantedAsync(permissionName))
                    {
                        var permissionRoles = roles.Where(x => x.Role.Permissions.Any(p => p.Permission == permissionName)).ToList();
                        grantedPermissions.Add(new GrantedPermissionDto
                        {
                            Permission = permissionName,
                            PermissionedEntity = permissionRoles.Any(x => !x.PermissionedEntities.Any())
                                ? new List<EntityReferenceDto<string>>()
                                : permissionRoles.SelectMany(x => x.PermissionedEntities).Distinct()
                                    .Select(x => new EntityReferenceDto<string>(x.Id, x._className, x._displayName))
                                    .ToList()
                        });
                    }
                }
            }

            return grantedPermissions;
        }

        /// <summary>
        /// I am using this method to get user roles and it is being used on login of a user and also when changing work Order Type, Please contact me(Moses) before removing it
        /// </summary>
        /// <returns></returns>
        [DisableAuditing]
        public async Task<List<string>> GetGrantedShaRolesAsync()
        {
            var currentUser = AbpSession.UserId.HasValue
                ? await GetCurrentPersonAsync()
                : null;
            if (currentUser == null)
                return new List<string>();
            var roles = await _roleAppointmentRepository.GetAll()
                .Where(a => a.Person == currentUser)
                .Select(a => a.Role.Name)
                .Distinct()
                .ToListAsync();
            return roles;
        }

        /// <summary>
        /// Clears permissions cache
        /// </summary>
        [HttpPost]
        public Task ClearPermissionsCacheAsync()
        {
            return _permissionChecker.ClearPermissionsCacheAsync();
        }
    }
}
