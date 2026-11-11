using Abp.Domain.Repositories;
using Shesha.Authorization;
using Shesha.DeviceForceUpdate.Dto;
using Shesha.Domain.Enums;
using Shesha.Extensions;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.DeviceForceUpdate
{
    [SheshaAuthorize(RefListPermissionedAccess.RequiresPermissions, PermissionNames.Application_Configure, PermissionNames.Application_Settings, PermissionNames.Application_Maintenance)]
    public class DeviceForceUpdateAppService : SheshaCrudServiceBase<Shesha.Domain.DeviceForceUpdate, DeviceForceUpdateDto, Guid>, IDeviceForceUpdateAppService
    {
        private readonly IEntityTypeProvider _entityTypeProvider;

        public DeviceForceUpdateAppService(IRepository<Shesha.Domain.DeviceForceUpdate, Guid> repository, IEntityTypeProvider entityTypeProvider) : base(repository)
        {
            _entityTypeProvider = entityTypeProvider;
        }

        public override async Task<DeviceForceUpdateDto> CreateAsync(DeviceForceUpdateDto input)
        {
            var existing = await GetBaseTypeRowsAsync(input.OSType);
            foreach (var item in existing)
                await Repository.DeleteAsync(item);

            var itemToSave = ObjectMapper.Map<Shesha.Domain.DeviceForceUpdate>(input);
            await Repository.InsertAsync(itemToSave);
            await CurrentUnitOfWork.SaveChangesAsync();

            return ObjectMapper.Map<DeviceForceUpdateDto>(itemToSave);
        }

        [SheshaAuthorize(RefListPermissionedAccess.AnyAuthenticated)]
        public async Task<DeviceForceUpdateDto> GetForceUpdateByOSTypeAsync(int osType)
        {
            var currentForceUpdate = await Repository.GetAll()
                .Where(r => r.OSType == osType)
                .OrderByDescending(r => r.CreationTime)
                .FirstOrDefaultAsync();

            return currentForceUpdate != null
                ? ObjectMapper.Map<DeviceForceUpdateDto>(currentForceUpdate)
                : null;
        }

        // The repository also returns rows of subclasses, so keep only rows of the exact base type
        private async Task<List<Shesha.Domain.DeviceForceUpdate>> GetBaseTypeRowsAsync(int? osType)
        {
            var rows = await Repository.GetAll().Where(r => r.OSType == osType).ToListAsync();
            return rows.Where(r => _entityTypeProvider.GetEntityType(r) == typeof(Shesha.Domain.DeviceForceUpdate)).ToList();
        }
    }
}
