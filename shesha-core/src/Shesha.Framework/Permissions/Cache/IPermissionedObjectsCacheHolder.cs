using Shesha.Cache;

namespace Shesha.Permissions.Cache
{
    public interface IPermissionedObjectsCacheHolder : ICacheHolder<string, CacheItemWrapper<PermissionedObjectDto>>
    {
    }
}
