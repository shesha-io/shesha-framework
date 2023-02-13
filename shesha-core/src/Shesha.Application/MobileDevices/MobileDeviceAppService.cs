using Abp.Domain.Repositories;
using Shesha.Domain;
using System;
using System.Threading.Tasks;

namespace Shesha.MobileDevices;

public class MobileDeviceAppService: SheshaCrudServiceBase<MobileDevice, MobileDeviceDto, Guid>
{
    public MobileDeviceAppService(IRepository<MobileDevice, Guid> repository) : base(repository)
    {
    }

    public async Task<MobileDeviceDto> GetDeviceByEmei(string imei)
    {
        var device = await Repository.FirstOrDefaultAsync(r => r.IMEI == imei);
        return ObjectMapper.Map<MobileDeviceDto>(device);
    }
}