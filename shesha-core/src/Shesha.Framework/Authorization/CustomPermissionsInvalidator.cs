using Abp.Authorization.Users;
using Abp.Dependency;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.Runtime.Caching;

namespace Shesha.Authorization
{
    public class CustomPermissionsInvalidator :
        IEventHandler<EntityDeletedEventData<AbpUserBase>>,
        ITransientDependency
    {
        private readonly ICacheManager _cacheManager;

        public CustomPermissionsInvalidator(ICacheManager cacheManager)
        {
            _cacheManager = cacheManager;
        }

        public void HandleEvent(EntityDeletedEventData<AbpUserBase> eventData)
        {
            var cacheKey = eventData.Entity.Id + "@" + (eventData.Entity.TenantId ?? 0);
            _cacheManager.GetCustomUserPermissionCache().Remove(cacheKey);
        }
    }
}
