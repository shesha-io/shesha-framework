using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Shesha.MultiTenancy.Dto;

namespace Shesha.MultiTenancy
{
    public interface ITenantAppService : IAsyncCrudAppService<TenantDto, int, PagedTenantResultRequestDto, CreateTenantDto, TenantDto>
    {
    }
}

