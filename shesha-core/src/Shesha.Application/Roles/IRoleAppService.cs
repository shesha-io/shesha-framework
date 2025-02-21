using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Shesha.Roles.Dto;
using System.Threading.Tasks;

namespace Shesha.Roles
{
    public interface IRoleAppService : IAsyncCrudAppService<RoleDto, int, PagedRoleResultRequestDto, CreateRoleDto, RoleDto>
    {
        Task<ListResultDto<PermissionDto>> GetAllPermissionsAsync();

        Task<GetRoleForEditOutput> GetRoleForEditAsync(EntityDto input);

        Task<ListResultDto<RoleListDto>> GetRolesAsync(GetRolesInput input);
    }
}
