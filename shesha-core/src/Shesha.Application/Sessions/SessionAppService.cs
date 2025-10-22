using Abp.Auditing;
using Abp.Domain.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shesha.Authorization;
using Shesha.Authorization.Roles;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
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

        public IHomePageRouter HomePageRouter { get; set; } = new NullHomePageRouter();

        public SessionAppService(IRepository<ShaRoleAppointedPerson, Guid> roleAppointmentRepository, IShaPermissionChecker permissionChecker)
        {
            _roleAppointmentRepository = roleAppointmentRepository;
            _permissionChecker = permissionChecker;
        }

        [Obsolete]
        [AllowAnonymous]

        public async Task<GetCurrentLoginInfoOutput> GetCurrentLoginInformationsAsync()
        {
            return await GetCurrentLoginInfoAsync();
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

                var roles = await _roleAppointmentRepository.GetAll().Where(a => a.Person == currentUser && a.Role != null).ToListAsync().ConfigureAwait(false);
                var allPermissionNames = PermissionManager.GetAllPermissions(false).Select(p => p.Name).ToList();

                // Check if user is System Administrator
                var isSystemAdministrator = roles.Any(r => r.Role!.Name == StaticRoleNames.SystemAdministrator);

                // Group permissions by name and collect all associated PermissionedEntities
                var permissionGroups = roles
                    .SelectMany(role => role.Role!.Permissions
                        .Where(p => p.IsGranted)
                        .Select(p => new { p.Permission, Role = role }))
                    .GroupBy(x => x.Permission)
                    .ToList();

                // Collect all permissions with their entities, handling duplicates properly
                var permissionMap = new Dictionary<string, GrantedPermissionDto>();

                // First, process explicitly granted permissions from roles
                foreach (var permissionGroup in permissionGroups)
                {
                    var permissionName = permissionGroup.Key;

                    // Check if user has this permission granted (or if they're system admin)
                    if (isSystemAdministrator || await PermissionChecker.IsGrantedAsync(permissionName))
                    {
                        var roleAppointmentsWithPermission = permissionGroup.Select(x => x.Role).ToList();
                        var permissionedEntities = new List<EntityReferenceDto<string>>();
                        var hasGlobalPermission = false;

                        foreach (var roleAppointment in roleAppointmentsWithPermission)
                        {
                            if (roleAppointment.PermissionedEntities == null || !roleAppointment.PermissionedEntities.Any())
                            {
                                // If any role appointment has no PermissionedEntities, this is a global permission
                                hasGlobalPermission = true;
                            }
                            else
                            {
                                // Add specific entities from this role appointment
                                permissionedEntities.AddRange(
                                    roleAppointment.PermissionedEntities.Select(x =>
                                        new EntityReferenceDto<string>(x.Id, x._displayName, x._className))
                                );
                            }
                        }

                        var deduped = permissionedEntities.DistinctBy(e => new { e._className, e.Id }).ToList();

                        // Handle duplicates
                        if (permissionMap.ContainsKey(permissionName))
                        {
                            var existing = permissionMap[permissionName];
                            if (existing.PermissionedEntity.Any() || (!hasGlobalPermission && deduped.Any()))
                            {
                                // Keep existing if it has entities, or update if current has entities and existing doesn't
                                if (!existing.PermissionedEntity.Any() && deduped.Any())
                                {
                                    permissionMap[permissionName] = new GrantedPermissionDto
                                    {
                                        Permission = permissionName,
                                        PermissionedEntity = deduped
                                    };
                                }
                                // If existing already has entities, merge them
                                else if (existing.PermissionedEntity.Any() && deduped.Any())
                                {
                                    var mergedEntities = existing.PermissionedEntity.Concat(deduped)
                                        .DistinctBy(e => new { e._className, e.Id }).ToList();
                                    permissionMap[permissionName] = new GrantedPermissionDto
                                    {
                                        Permission = permissionName,
                                        PermissionedEntity = mergedEntities
                                    };
                                }
                            }
                        }
                        else
                        {
                            permissionMap[permissionName] = new GrantedPermissionDto
                            {
                                Permission = permissionName,
                                PermissionedEntity = hasGlobalPermission && !deduped.Any()
                                    ? new List<EntityReferenceDto<string>>()  // Empty list = global permission
                                    : deduped  // Specific entities
                            };
                        }
                    }
                }

                // For system administrators, add any missing permissions as global
                if (isSystemAdministrator)
                {
                    foreach (var permissionName in allPermissionNames)
                    {
                        if (!permissionMap.ContainsKey(permissionName))
                        {
                            permissionMap[permissionName] = new GrantedPermissionDto
                            {
                                Permission = permissionName,
                                PermissionedEntity = new List<EntityReferenceDto<string>>() // Global permission
                            };
                        }
                    }
                }

                grantedPermissions.AddRange(permissionMap.Values);
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
                .Where(a => a.Person == currentUser && a.Role != null)
                .Select(a => a.Role!.Name)
                .Distinct()
                .ToListAsync();
            return roles;
        }

        /// <summary>
        /// Clears permissions cache
        /// </summary>
        [HttpPost]
        public async Task ClearPermissionsCacheAsync()
        {
            await _permissionChecker.ClearPermissionsCacheAsync();
        }
    }
}
