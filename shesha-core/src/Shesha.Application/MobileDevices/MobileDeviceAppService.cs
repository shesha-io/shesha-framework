using Abp.Domain.Repositories;
using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;
using System;
using System.Threading.Tasks;

namespace Shesha.MobileDevices;

public class MobileDeviceAppService : DynamicCrudAppService<MobileDevice, DynamicDto<MobileDevice, Guid>, Guid>
{
    public MobileDeviceAppService(IRepository<MobileDevice, Guid> repository) : base(repository)
    {
    }

    public async Task<MobileDeviceDto> GetDeviceByEmei(string imei)
    {
        var device = await Repository.FirstOrDefaultAsync(r => r.IMEI == imei);
        return device != null
            ? ObjectMapper.Map<MobileDeviceDto>(device)
            : null;
    }
}