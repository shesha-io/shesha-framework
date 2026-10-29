using Abp;
using Abp.Application.Features;
using Abp.Collections.Extensions;
using Abp.Localization;
using Shesha.MultiTenancy;
using System.Collections.Generic;

namespace Shesha.Authorization
{
    public abstract class PermissionDefinitionContextBase : IPermissionDefinitionContext
    {
        protected readonly PermissionDictionary Permissions;

        protected PermissionDefinitionContextBase()
        {
            Permissions = new PermissionDictionary();
        }

        public Permission CreatePermission(
            string name,
            ILocalizableString? displayName = null,
            ILocalizableString? description = null,
            MultiTenancySides multiTenancySides = MultiTenancySides.Host | MultiTenancySides.Tenant,
            IFeatureDependency? featureDependency = null,
            Dictionary<string, object?>? properties = null)
        {
            if (Permissions.ContainsKey(name))
            {
                throw new AbpException("There is already a permission with name: " + name);
            }

            var permission = new Permission(name, displayName, description, multiTenancySides, featureDependency, properties);
            Permissions[permission.Name] = permission;
            return permission;
        }

        public virtual Permission? GetPermissionOrNull(string? name)
        {
            return !string.IsNullOrWhiteSpace(name) 
                ? Permissions.GetOrDefault(name)
                : null;
        }

        public virtual void RemovePermission(string name)
        {
            Permissions.Remove(name);
        }
    }
}
