using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Runtime.Session;
using Microsoft.AspNetCore.Mvc;
using NHibernate.Linq;
using Shesha.Application.Services.Dto;
using Shesha.Authorization;
using Shesha.Domain;
using Shesha.Roles.Dto;
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

        public ShaRoleAppService(
            IRepository<ShaRole, Guid> repository,
            IShaPermissionChecker shaPermissionChecker,
            IRepository<ShaRoleAppointedPerson, Guid> roleAppointmentRepository
            ) : base(repository)
        {
            _shaPermissionChecker = shaPermissionChecker;
            _roleAppointmentRepository = roleAppointmentRepository;

            GetPermissionName = GetAllPermissionName = CreatePermissionName = UpdatePermissionName = DeletePermissionName = PermissionNames.Pages_Roles;
        }

        public override async Task<ShaRoleDto> CreateAsync(CreateShaRoleDto input)
        {
            CheckCreatePermission();

            var role = ObjectMapper.Map<ShaRole>(input);
            role.VersionNo = 1;
            // ToDo: implement versioning of ShaRole
            role.VersionStatus = Domain.ConfigurationItems.ConfigurationItemVersionStatus.Live;

            await Repository.InsertAsync(role);
            await CurrentUnitOfWork.SaveChangesAsync();

            return MapToEntityDto(role);
        }

        public override async Task<ShaRoleDto> UpdateAsync(ShaRoleDto input)
        {
            CheckUpdatePermission();

            var role = await Repository.GetAsync(input.Id);

            ObjectMapper.Map(input, role);

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
            var isGranted = await _roleAppointmentRepository.GetAll().AnyAsync(a => a.Person != null && a.Person.User != null && a.Person.User.Id == userId && a.Role.Name == input.RoleName);
            return isGranted;
        }
    }
}

