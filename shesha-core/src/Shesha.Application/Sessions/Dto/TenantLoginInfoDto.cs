using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using Shesha.MultiTenancy;

namespace Shesha.Sessions.Dto
{
    [AutoMapFrom(typeof(Tenant))]
    public class TenantLoginInfoDto : EntityDto
    {
        public string TenancyName { get; set; }

        public string Name { get; set; }
    }
}
