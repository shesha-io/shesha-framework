using Castle.DynamicProxy;

namespace Shesha.Permissions.Entity
{
    public interface IPermissionedEntityInterceptor : IInterceptor
    {
        void SetProvider(IPermissionedEntityProvider provider);
    }
}
