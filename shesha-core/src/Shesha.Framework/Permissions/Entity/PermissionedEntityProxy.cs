namespace Shesha.Permissions.Entity
{
    public interface IPermissionedEntityProxy
    {
        IPermissionedEntityProvider Provider { get; }
    }

    public class PermissionedEntityProxy : IPermissionedEntityProxy
    {
        public PermissionedEntityProxy(IPermissionedEntityProvider provider) => Provider = provider;

        public IPermissionedEntityProvider Provider { get; }
    }
}
