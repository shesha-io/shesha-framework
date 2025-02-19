using Abp.Authorization.Users;
using Abp.Dependency;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Shesha.Authorization.Cache;
using System.Threading.Tasks;

namespace Shesha.Authorization
{
    public class CustomPermissionsInvalidator :
        IAsyncEventHandler<EntityDeletedEventData<AbpUserBase>>,
        ITransientDependency
    {
        private readonly ICustomUserPermissionCacheHolder _cacheHolder;

        public CustomPermissionsInvalidator(ICustomUserPermissionCacheHolder cacheHolder)
        {
            _cacheHolder = cacheHolder;
        }

        public async Task HandleEventAsync(EntityDeletedEventData<AbpUserBase> eventData)
        {
            var cacheKey = eventData.Entity.Id + "@" + (eventData.Entity.TenantId ?? 0);
            await _cacheHolder.Cache.RemoveAsync(cacheKey);
        }
    }
}
