﻿using Abp.Domain.Repositories;
using Shesha.DeviceForceUpdate.Dto;
using Shesha.Extensions;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.DeviceForceUpdate
{
    public class DeviceForceUpdateAppService  : SheshaCrudServiceBase<Shesha.Domain.DeviceForceUpdate, DeviceForceUpdateDto, Guid> , IDeviceForceUpdateAppService
    {
        //private readonly 
        public DeviceForceUpdateAppService(IRepository<Shesha.Domain.DeviceForceUpdate, Guid> repository) : base(repository)
        {

        }

        public async override Task<DeviceForceUpdateDto> CreateAsync(DeviceForceUpdateDto input)
        {
            var storedForceUpdates = await Repository.GetAll().ToListAsync();
            var activeForceUpdates = storedForceUpdates.Where(r => r.OSType == input.OSType);
            foreach (var item in activeForceUpdates)
               await Repository.DeleteAsync(item);

            var itemToSave = ObjectMapper.Map<Shesha.Domain.DeviceForceUpdate>(input);
            await Repository.InsertAsync(itemToSave);
            return input;
        }

        public async Task<DeviceForceUpdateDto?> GetForceUpdateByOSTypeAsync(int osType)
        {
            var items = await Repository.GetAll().Where(r => r.OSType == osType && !r.IsDeleted).ToListAsync();
            var currentForceUpdate = items.FirstOrDefault();
            if (currentForceUpdate != null)
                return ObjectMapper.Map<DeviceForceUpdateDto>(currentForceUpdate);
            return null;
        }

    }
}
