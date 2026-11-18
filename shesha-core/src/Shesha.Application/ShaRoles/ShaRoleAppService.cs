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

            await Repository.UpdateAsync(role);
            await CurrentUnitOfWork.SaveChangesAsync();

            // clear only once the transaction actually commits, so a concurrent permission check can't
            // cache a stale result in the window between the in-method save and the real commit
            CurrentUnitOfWork.Completed += (sender, args) => ClearPermissionsCacheOnCompleted();

            return MapToEntityDto(role);
        }

        public override async Task DeleteAsync(EntityDto<Guid> input)
        {
            CheckDeletePermission();

            var role = await Repository.GetAsync(input.Id);

            await Repository.DeleteAsync(role);
            await CurrentUnitOfWork.SaveChangesAsync();

            CurrentUnitOfWork.Completed += (sender, args) => ClearPermissionsCacheOnCompleted();
        }

        private void ClearPermissionsCacheOnCompleted()
        {
            var task = Task.Run(async () =>
            {
                try
                {
                    await _shaPermissionChecker.ClearPermissionsCacheAsync();
                }
                catch (Exception ex)
                {
                    Logger.Error("Failed to clear permissions cache after role change", ex);
                }
            });
        }

        /// <summary>
        /// Checks if current user is granted for a role.
        /// </summary>
        [HttpGet]
        [SheshaAuthorize(Domain.Enums.RefListPermissionedAccess.AnyAuthenticated)]
        public async Task<bool> IsRoleGrantedAsync(IsRoleGrantedInput input)
        {
            var userId = AbpSession.GetUserId();

            // Appointments always point at the top-most module's role (ShaRoleManager keeps them in
            // sync on expose and on new appointments), so a direct id comparison is enough here.
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

                return await _roleAppointmentRepository.AnyAsync(a => a.Person != null && a.Person.User != null && a.Person.User.Id == userId && a.Role.Id == targetRole.Id);
            }

            var isGranted = await _roleAppointmentRepository.AnyAsync(a => a.Person != null && a.Person.User != null && a.Person.User.Id == userId && a.Role.Name == input.RoleName);
            return isGranted;
        }
    }
}

