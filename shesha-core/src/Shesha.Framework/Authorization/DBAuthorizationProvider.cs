using Abp.Authorization;
using Abp.Domain.Uow;
using Shesha.Domain;
using Shesha.Reflection;
using Shesha.Utilities;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.Authorization
{
    public class DbAuthorizationProvider : AuthorizationProvider
    {
        public DbAuthorizationProvider()
        {
        }

        [UnitOfWork]
        public override void SetPermissions(IPermissionDefinitionContext context)
        {
        }

        private void CreateChildPermissions(List<PermissionDefinition> dbPermissions, Abp.Authorization.Permission permission)
        {
            var dbChildPermissions = dbPermissions.Where(x => x.Parent == permission.Name).ToList();
            foreach (var dbChildPermission in dbChildPermissions)
            {
                var childPermission = permission.CreateChildPermission(dbChildPermission.Name, dbChildPermission.NotNull().Label?.L(), dbChildPermission.Description?.L());
                CreateChildPermissions(dbPermissions, childPermission);
                dbPermissions.Remove(dbChildPermission);
            }
        }
    }
}
