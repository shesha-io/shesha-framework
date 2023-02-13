using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp;
using Abp.Application.Features;
using Abp.Authorization;
using Abp.Collections.Extensions;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Localization;
using Abp.MultiTenancy;
using NHibernate.Linq;
using Shesha.Domain;
using Shesha.Utilities;

namespace Shesha.Authorization
{
    public class ShaPermissionManager : PermissionManager, IShaPermissionManager
    {
        private readonly IIocManager _iocManager;
        private readonly IRepository<PermissionDefinition, Guid> _permissionDefinitionRepository;
        private readonly IAuthorizationConfiguration _authorizationConfiguration;
        private readonly IShaPermissionChecker _shaPermissionChecker;

        public ShaPermissionManager(
            IIocManager iocManager,
            IAuthorizationConfiguration authorizationConfiguration, 
            IUnitOfWorkManager unitOfWorkManager,
            IMultiTenancyConfig multiTenancyConfig,
            IRepository<PermissionDefinition, Guid> permissionDefinitionRepository,
            IShaPermissionChecker shaPermissionChecker
            ) : 
            base(iocManager, authorizationConfiguration, unitOfWorkManager, multiTenancyConfig)
        {
            _iocManager = iocManager;
            _authorizationConfiguration = authorizationConfiguration;
            _permissionDefinitionRepository = permissionDefinitionRepository;
            _shaPermissionChecker = shaPermissionChecker;
        }

        public Abp.Authorization.Permission CreatePermission(Abp.Authorization.Permission parent, string name, ILocalizableString displayName = null,
            ILocalizableString description = null,
            MultiTenancySides multiTenancySides = MultiTenancySides.Tenant | MultiTenancySides.Host,
            IFeatureDependency featureDependency = null, Dictionary<string, object> properties = null)
        {
            throw new NotImplementedException();
        }

        public Abp.Authorization.Permission EditPermission(string oldName, Abp.Authorization.Permission parent, string name, ILocalizableString displayName = null,
            ILocalizableString description = null,
            MultiTenancySides multiTenancySides = MultiTenancySides.Tenant | MultiTenancySides.Host,
            IFeatureDependency featureDependency = null, Dictionary<string, object> properties = null)
        {
            throw new NotImplementedException();
        }

        public async Task<Abp.Authorization.Permission> CreatePermissionAsync(PermissionDefinition permission)
        {
            var newPermission = await _CreatePermissionAsync(permission);

            await _permissionDefinitionRepository.InsertOrUpdateAsync(permission);
            Permissions.AddAllPermissions();

            return newPermission;
        }

        private async Task<Abp.Authorization.Permission> _CreatePermissionAsync(PermissionDefinition permission)
        {
            Abp.Authorization.Permission newPermission = null;
            if (!string.IsNullOrEmpty(permission.Parent))
            {
                // add new permission to parent
                var parent = GetPermission(permission.Parent);
                if (parent != null)
                {
                    newPermission = parent.CreateChildPermission(permission.Name,
                        (permission.DisplayName ?? "").L(),
                        (permission.Description ?? "").L(),
                        properties: new Dictionary<string, object>() { { "IsDbPermission", true } }
                    );
                }
            }
            else
            {
                newPermission = CreatePermission(
                    permission.Name,
                    (permission.DisplayName ?? "").L(),
                    (permission.Description ?? "").L(),
                    properties: new Dictionary<string, object>() { { "IsDbPermission", true } });
            }

            return newPermission;
        }

        public async Task<Abp.Authorization.Permission> EditPermissionAsync(string oldName, PermissionDefinition permission)
        {
            var dbPermission = _permissionDefinitionRepository.GetAll().FirstOrDefault(x => x.Name == oldName);

            // ToDo: Add NotFound exception or something else
            if (dbPermission == null) return null;

            if (dbPermission.Name != permission.Name
                || dbPermission.DisplayName != permission.DisplayName
                || dbPermission.Description != permission.Description
            )
            {
                dbPermission.Name = permission.Name;
                dbPermission.Description = permission.Description;
                dbPermission.DisplayName = permission.DisplayName;
                dbPermission.Parent = permission.Parent;

                RemovePermission(oldName);
                var parent = !string.IsNullOrEmpty(permission.Parent)
                    ? GetPermissionOrNull(permission.Parent)
                    : null;

                parent?.RemoveChildPermission(oldName);

                var newPermission = await _CreatePermissionAsync(permission);

                await _permissionDefinitionRepository.InsertOrUpdateAsync(dbPermission);

                Permissions.AddAllPermissions();

                return newPermission;
            }

            return GetPermissionOrNull(oldName);
        }

        public async Task UpdateParentAsync(string name, string parentName)
        {
            var dbPermission = _permissionDefinitionRepository.GetAll().FirstOrDefault(x => x.Name == name);

            // ToDo: Add NotFound exception or something else
            if (dbPermission == null) return;

            InternalDeletePermission(dbPermission);

            dbPermission.Parent = parentName;
            await _CreatePermissionAsync(dbPermission);
            Permissions.AddAllPermissions();

            await _permissionDefinitionRepository.UpdateAsync(dbPermission);
        }

        private void InternalDeletePermission(PermissionDefinition permission)
        {
            if (!string.IsNullOrEmpty(permission.Parent))
            {
                var parent = GetPermissionOrNull(permission.Parent);
                parent?.RemoveChildPermission(permission.Name);
            }

            RemovePermission(permission.Name);

        }

        public async Task DeletePermissionAsync(string name)
        {
            var dbPermission = _permissionDefinitionRepository.GetAll().FirstOrDefault(x => x.Name == name);

            // ToDo: Add NotFound exception or something else
            if (dbPermission == null) return;

            InternalDeletePermission(dbPermission);

            await _permissionDefinitionRepository.DeleteAsync(dbPermission);
        }
    }
}