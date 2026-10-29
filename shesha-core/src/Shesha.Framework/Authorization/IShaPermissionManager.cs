using Abp.Application.Features;
using Abp.Localization;
using Shesha.MultiTenancy;
using Shesha.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Authorization
{
    public interface IShaPermissionManager : IPermissionManager
    {
        Permission CreatePermission(
            Permission parent,
            string name,
            ILocalizableString? displayName = null,
            ILocalizableString? description = null,
            MultiTenancySides multiTenancySides = MultiTenancySides.Host | MultiTenancySides.Tenant,
            IFeatureDependency? featureDependency = null,
            Dictionary<string, object>? properties = null);

        Permission EditPermission(
            string oldName,
            Permission parent,
            string name,
            ILocalizableString? displayName = null,
            ILocalizableString? description = null,
            MultiTenancySides multiTenancySides = MultiTenancySides.Host | MultiTenancySides.Tenant,
            IFeatureDependency? featureDependency = null,
            Dictionary<string, object>? properties = null);

        Task<Permission> CreatePermissionAsync(PermissionDefinition permission);

        Task<Permission> EditPermissionAsync(string oldName, PermissionDefinition permission);

        Task UpdateParentAsync(string name, string? parentName, Module? module);

        Task DeletePermissionAsync(string name);

    }
}