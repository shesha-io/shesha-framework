using System;
using System.Threading.Tasks;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Shesha.DeviceRegistrations.Dto;
using Shesha.Domain;

namespace Shesha.DeviceRegistrations
{
    [AbpAuthorize()]
    public class DeviceRegistrationAppService : SheshaAppServiceBase, IDeviceRegistrationAppService
    {
        private readonly IRepository<DeviceRegistration, Guid> _repository;
        public DeviceRegistrationAppService(IRepository<DeviceRegistration, Guid> repository)
        {
            _repository = repository;
        }

        public async Task<DeviceRegistrationDto> CreateAsync(DeviceRegistrationInput input)
        {
            var currentPerson = await GetCurrentPersonAsync();
            var deviceRegistration = await _repository.FirstOrDefaultAsync(r => r.Person == currentPerson);

            if (deviceRegistration == null)
            {
                var deviceReg = await SaveOrUpdateEntityAsync<DeviceRegistration>(null, async item =>
                {
                    ObjectMapper.Map(input, item);
                    item.Person = currentPerson;
                });

                return ObjectMapper.Map<DeviceRegistrationDto>(deviceReg);
            }

            var entity = await SaveOrUpdateEntityAsync<DeviceRegistration>(deviceRegistration?.Id, async item =>
            {
                ObjectMapper.Map(input, item);
                item.Person = currentPerson;
            });

            return ObjectMapper.Map<DeviceRegistrationDto>(entity);
        }

        public async Task<DeviceRegistrationDto> UpdateAsync(DeviceRegistrationInput input)
        {
            var currentPerson = await GetCurrentPersonAsync();
            var deviceRegistration = await _repository.FirstOrDefaultAsync(r => r.Person == currentPerson);

            var deviceReg = await SaveOrUpdateEntityAsync<DeviceRegistration>(deviceRegistration?.Id, async item =>
            {
                ObjectMapper.Map(input, item);
                item.Person = currentPerson;
            });

            return ObjectMapper.Map<DeviceRegistrationDto>(deviceReg);
        }
    }
}
