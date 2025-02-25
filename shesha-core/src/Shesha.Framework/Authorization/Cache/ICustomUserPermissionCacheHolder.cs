using Shesha.Authorization.Dtos;
using Shesha.Cache;

namespace Shesha.Authorization.Cache
{
    public interface ICustomUserPermissionCacheHolder : ICacheHolder<string, CustomUserPermissionCacheItem>
    {
    }
}
