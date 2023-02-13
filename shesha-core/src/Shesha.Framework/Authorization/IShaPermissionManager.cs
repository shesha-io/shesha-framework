using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Application.Features;
using Abp.Authorization;
using Abp.Localization;
using Abp.MultiTenancy;
using Shesha.Domain;

namespace Shesha.Authorization
{
    public interface IShaPermissionManager: IPermissionManager
    {
        Abp.Authorization.Permission CreatePermission(
            Abp.Authorization.Permission parent,
            string name,
            ILocalizableString displayName = null,
            ILocalizableString description = null,
            MultiTenancySides multiTenancySides = MultiTenancySides.Host | MultiTenancySides.Tenant,
            IFeatureDependency featureDependency = null,
            Dictionary<string, object> properties = null);

        Abp.Authorization.Permission EditPermission(
            string oldName,
            Abp.Authorization.Permission parent,
            string name,
            ILocalizableString displayName = null,
            ILocalizableString description = null,
            MultiTenancySides multiTenancySides = MultiTenancySides.Host | MultiTenancySides.Tenant,
            IFeatureDependency featureDependency = null,
            Dictionary<string, object> properties = null);

        Task<Abp.Authorization.Permission> CreatePermissionAsync(PermissionDefinition permission);

        Task<Abp.Authorization.Permission> EditPermissionAsync(string oldName, PermissionDefinition permission);

        Task UpdateParentAsync(string name, string parentName);

        Task DeletePermissionAsync(string name);

    }
}