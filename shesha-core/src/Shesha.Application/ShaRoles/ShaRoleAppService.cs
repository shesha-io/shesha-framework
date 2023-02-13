using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Shesha.Application.Services.Dto;
using Shesha.Authorization;
using Shesha.Domain;
using Shesha.Roles.Dto;
using Shesha.ShaRoles.Dto;
using System;
using System.Threading.Tasks;

namespace Shesha.ShaRoles
{
    [AbpAuthorize(PermissionNames.Pages_Roles)]
    public class ShaRoleAppService : SheshaCrudServiceBase<ShaRole, ShaRoleDto, Guid, FilteredPagedAndSortedResultRequestDto, CreateShaRoleDto, ShaRoleDto>, IShaRoleAppService
    {
        private readonly IShaPermissionChecker _shaPermissionChecker;

        public ShaRoleAppService(
            IRepository<ShaRole, Guid> repository,
            IShaPermissionChecker shaPermissionChecker
            ) : base(repository)
        {
            _shaPermissionChecker = shaPermissionChecker;
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
    }
}

