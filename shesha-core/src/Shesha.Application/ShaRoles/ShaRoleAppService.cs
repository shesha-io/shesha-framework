using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Abp.Runtime.Session;
using Microsoft.AspNetCore.Mvc;
using NHibernate.Linq;
using Shesha.Application.Services.Dto;
using Shesha.Authorization;
using Shesha.ConfigurationItems.Exceptions;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Roles;
using Shesha.ShaRoles.Dto;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.ShaRoles
{
    [SheshaAuthorize(Domain.Enums.RefListPermissionedAccess.AnyAuthenticated)]
    public class ShaRoleAppService : SheshaCrudServiceBase<ShaRole, ShaRoleDto, Guid, FilteredPagedAndSortedResultRequestDto, CreateShaRoleDto, ShaRoleDto>, IShaRoleAppService
    {
        private readonly IShaPermissionChecker _shaPermissionChecker;
        private readonly IRepository<ShaRoleAppointedPerson, Guid> _roleAppointmentRepository;
        private readonly IShaRoleManager _roleManager;

        public ShaRoleAppService(
            IRepository<ShaRole, Guid> repository,
            IShaPermissionChecker shaPermissionChecker,
            IRepository<ShaRoleAppointedPerson, Guid> roleAppointmentRepository,
            IShaRoleManager roleManager
            ) : base(repository)
        {
            _shaPermissionChecker = shaPermissionChecker;
            _roleAppointmentRepository = roleAppointmentRepository;
            _roleManager = roleManager;

            GetPermissionName = GetAllPermissionName = CreatePermissionName = UpdatePermissionName = DeletePermissionName = PermissionNames.Role_Manage;
        }

        public override async Task<ShaRoleDto> CreateAsync(CreateShaRoleDto input)
        {
            CheckCreatePermission();

            var role = ObjectMapper.Map<ShaRole>(input);

            await Repository.InsertAsync(role);
            await CurrentUnitOfWork.SaveChangesAsync();

            return MapToEntityDto(role);
        }

        public override async Task<ShaRoleDto> UpdateAsync(ShaRoleDto input)
        {
            CheckUpdatePermission();

            var role = await Repository.GetAsync(input.Id);

            role.Label = input.Label;
            role.Description = input.Description;
            role.MapPermissions(input.Permissions);            

            await _shaPermissionChecker.ClearPermissionsCacheAsync();

            await Repository.UpdateAsync(role);
            await CurrentUnitOfWork.SaveChangesAsync();

            return MapToEntityDto(role);
        }

        public override async Task DeleteAsync(EntityDto<Guid> input)
        {
            CheckDeletePermission();

            var role = await Repository.GetAsync(input.Id);
            
            await Repository.DeleteAsync(role);
        }

        /// <summary>
        /// Checks if current user is granted for a role.
        /// </summary>
        [HttpGet]
        [SheshaAuthorize(Domain.Enums.RefListPermissionedAccess.AnyAuthenticated)]
        public async Task<bool> IsRoleGrantedAsync(IsRoleGrantedInput input)
        {
            var userId = AbpSession.GetUserId();

            // Resolve the target (top-most module wins), then check if any appointed role is the target
            // or one of its ExposedFrom ancestors - avoids re-resolving by name, which isn't order-safe.
            if (!string.IsNullOrWhiteSpace(input.Module))
            {
                ShaRole? targetRole;
                try
                {
                    targetRole = (ShaRole)await _roleManager.ResolveItemAsync(input.Module, input.RoleName, null);
                }
                catch (ConfigurationItemNotFoundException)
                {
                    return false;
                }

                var targetAncestorIds = new System.Collections.Generic.HashSet<Guid>();
                for (ConfigurationItem? ancestor = targetRole; ancestor != null; ancestor = ancestor.ExposedFrom)
                {
                    if (!targetAncestorIds.Add(ancestor.Id))
                        break; // guard against a cyclic ExposedFrom chain
                }

                var appointedRoleIds = await (await _roleAppointmentRepository.GetAllAsync())
                    .Where(a => a.Person != null && a.Person.User != null && a.Person.User.Id == userId && a.Role.Name == input.RoleName)
                    .Select(a => a.Role.Id)
                    .ToListAsync();

                return appointedRoleIds.Any(targetAncestorIds.Contains);
            }

            var isGranted = await _roleAppointmentRepository.AnyAsync(a => a.Person != null && a.Person.User != null && a.Person.User.Id == userId && a.Role.Name == input.RoleName);
            return isGranted;
        }
    }
}

