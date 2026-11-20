using Abp.Authorization.Users;
using Abp.Dependency;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Shesha.Authorization.Cache;
using Shesha.Domain;
using System.Threading.Tasks;

namespace Shesha.Authorization
{
    public class CustomPermissionsInvalidator :
        IAsyncEventHandler<EntityDeletedEventData<AbpUserBase>>,
        IAsyncEventHandler<EntityDeletedEventData<ShaRole>>,
        IAsyncEventHandler<EntityUpdatedEventData<ShaRole>>,
        IAsyncEventHandler<EntityCreatedEventData<ShaRole>>,
        IAsyncEventHandler<EntityCreatedEventData<ShaRoleAppointedPerson>>,
        IAsyncEventHandler<EntityUpdatedEventData<ShaRoleAppointedPerson>>,
        IAsyncEventHandler<EntityDeletedEventData<ShaRoleAppointedPerson>>,

        IAsyncEventHandler<EntityCreatedEventData<ShaRolePermission>>,
        IAsyncEventHandler<EntityUpdatedEventData<ShaRolePermission>>,
        IAsyncEventHandler<EntityDeletedEventData<ShaRolePermission>>,
        ITransientDependency
    {
        private readonly ICustomUserPermissionCacheHolder _cacheHolder;

        public CustomPermissionsInvalidator(ICustomUserPermissionCacheHolder cacheHolder)
        {
            _cacheHolder = cacheHolder;
        }

        public async Task HandleEventAsync(EntityDeletedEventData<AbpUserBase> eventData)
        {
            var cacheKey = ShaPermissionChecker.GetPermissionsCacheKey(eventData.Entity.Id, eventData.Entity.TenantId);
            await _cacheHolder.Cache.RemoveAsync(cacheKey);            
        }

        public async Task HandleEventAsync(EntityCreatedEventData<ShaRole> eventData)
        {
            await _cacheHolder.Cache.ClearAsync();
        }

        public async Task HandleEventAsync(EntityUpdatedEventData<ShaRole> eventData)
        {
            await _cacheHolder.Cache.ClearAsync();
        }

        public async Task HandleEventAsync(EntityDeletedEventData<ShaRole> eventData)
        {
            await _cacheHolder.Cache.ClearAsync();
        }

        public async Task HandleEventAsync(EntityCreatedEventData<ShaRoleAppointedPerson> eventData)
        {
            await _cacheHolder.Cache.ClearAsync();
        }

        public async Task HandleEventAsync(EntityUpdatedEventData<ShaRoleAppointedPerson> eventData)
        {
            await _cacheHolder.Cache.ClearAsync();
        }

        public async Task HandleEventAsync(EntityDeletedEventData<ShaRoleAppointedPerson> eventData)
        {
            await _cacheHolder.Cache.ClearAsync();
        }

        public async Task HandleEventAsync(EntityCreatedEventData<ShaRolePermission> eventData)
        {
            await _cacheHolder.Cache.ClearAsync();
        }

        public async Task HandleEventAsync(EntityUpdatedEventData<ShaRolePermission> eventData)
        {
            await _cacheHolder.Cache.ClearAsync();
        }

        public async Task HandleEventAsync(EntityDeletedEventData<ShaRolePermission> eventData)
        {
            await _cacheHolder.Cache.ClearAsync();
        }
    }
}
