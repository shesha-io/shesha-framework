using Abp.Application.Features;
using Abp.Authorization;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Localization;
using Abp.MultiTenancy;
using Abp.Threading;
using Shesha.Domain;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Authorization
{
    public class ShaPermissionManager : PermissionManager, IShaPermissionManager
    {
        private const string IsDbPermission = "IsDbPermission";
        private readonly IRepository<PermissionDefinition, Guid> _permissionDefinitionRepository;

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
            _permissionDefinitionRepository = permissionDefinitionRepository;
        }

        [UnitOfWork]
        public override void Initialize()
        {
            base.Initialize();

            AsyncHelper.RunSync(async () => await InitializeDbPermissionsAsync());
        }

        
        private async Task InitializeDbPermissionsAsync()
        {
            var dbPermissions = await _permissionDefinitionRepository.GetAllListAsync();

            // Update DB-related items
            var dbRootPermissions = dbPermissions.Where(x => string.IsNullOrEmpty(x.Parent)).ToList();
            foreach (var dbPermission in dbRootPermissions)
            {
                if (GetPermissionOrNull(dbPermission.Name) == null)
                {
                    var permission = await CreatePermissionAsync(dbPermission);
                    await CreateChildPermissionsAsync(dbPermissions, permission);
                }
                dbPermissions.Remove(dbPermission);
            }


            // Update code-related items
            while (dbPermissions.Any())
            {
                var dbPermission = dbPermissions.FirstOrDefault();
                if (dbPermission != null)
                {
                    var permission = GetPermissionOrNull(dbPermission.Parent);
                    while (permission == null && dbPermissions.Any(x => x.Name == dbPermission.Parent))
                    {
                        dbPermission = dbPermissions.First(x => x.Name == dbPermission.Parent);
                        permission = GetPermissionOrNull(dbPermission.Parent);
                    }

                    if (permission != null)
                    {
                        await CreateChildPermissionsAsync(dbPermissions, permission);
                    }
                    else
                    {
                        // remove permission with missed parent
                        await _permissionDefinitionRepository.DeleteAsync(dbPermission);
                    }
                    dbPermissions.Remove(dbPermission);
                }
            }
        }

        private async Task CreateChildPermissionsAsync(List<PermissionDefinition> dbPermissions, Abp.Authorization.Permission permission)
        {
            var dbChildPermissions = dbPermissions.Where(x => x.Parent == permission.Name).ToList();
            foreach (var dbChildPermission in dbChildPermissions)
            {
                if (GetPermissionOrNull(dbChildPermission.Name) == null)
                {
                    var childPermission = await CreatePermissionAsync(dbChildPermission);
                    await CreateChildPermissionsAsync(dbPermissions, childPermission);
                    dbPermissions.Remove(dbChildPermission);
                }
            }
        }

        public Abp.Authorization.Permission CreatePermission(Abp.Authorization.Permission parent, string name, ILocalizableString? displayName = null,
            ILocalizableString? description = null,
            MultiTenancySides multiTenancySides = MultiTenancySides.Tenant | MultiTenancySides.Host,
            IFeatureDependency? featureDependency = null, Dictionary<string, object>? properties = null)
        {
            throw new NotImplementedException();
        }

        public Abp.Authorization.Permission EditPermission(string oldName, Abp.Authorization.Permission parent, string name, ILocalizableString? displayName = null,
            ILocalizableString? description = null,
            MultiTenancySides multiTenancySides = MultiTenancySides.Tenant | MultiTenancySides.Host,
            IFeatureDependency? featureDependency = null, Dictionary<string, object>? properties = null)
        {
            throw new NotImplementedException();
        }

        public async Task<Abp.Authorization.Permission> CreatePermissionAsync(PermissionDefinition permissionDefinition)
        {
            var newPermission = await CreatePermissionInternalAsync(permissionDefinition);

            await _permissionDefinitionRepository.InsertOrUpdateAsync(permissionDefinition);
            Permissions.AddAllPermissions();

            return newPermission;
        }

        private Task<Abp.Authorization.Permission> CreatePermissionInternalAsync(PermissionDefinition permissionDefinition)
        {
            if (!string.IsNullOrEmpty(permissionDefinition.Parent))
            {
                // add new permission to parent
                var parent = GetPermission(permissionDefinition.Parent);
                var permission = parent.CreateChildPermission(permissionDefinition.Name,
                    (permissionDefinition.Label ?? "").L(),
                    (permissionDefinition.Description ?? "").L(),
                    properties: new Dictionary<string, object?>() 
                    { 
                        { IsDbPermission, true },
                        { "ModuleId", permissionDefinition.Module?.Id },
                    }
                );
                return Task.FromResult(permission);
            }
            else
            {
                var permission = CreatePermission(
                    permissionDefinition.Name,
                    (permissionDefinition.Label ?? "").L(),
                    (permissionDefinition.Description ?? "").L(),
                    properties: new Dictionary<string, object?>()
                    {
                        { IsDbPermission, true },
                        { "ModuleId", permissionDefinition.Module?.Id },
                    }
                );
                return Task.FromResult(permission);
            }
        }

        public async Task<Abp.Authorization.Permission> EditPermissionAsync(string oldName, PermissionDefinition permissionDefinition)
        {
            var dbPermission = _permissionDefinitionRepository.GetAll().FirstOrDefault(x => x.Name == oldName);

            if (dbPermission == null)
            {
                DeleteMissedDbPermission(oldName);
                throw new EntityNotFoundException($"Permission '{oldName}' not found");
            }

            if (dbPermission.Name != permissionDefinition.Name
                || dbPermission.Label != permissionDefinition.Label
                || dbPermission.Description != permissionDefinition.Description
                || dbPermission.Module != permissionDefinition.Module
            )
            {
                dbPermission.Name = permissionDefinition.Name;
                dbPermission.Description = permissionDefinition.Description;
                dbPermission.Label = permissionDefinition.Label;
                dbPermission.Parent = permissionDefinition.Parent;

                RemovePermission(oldName);
                var parent = !string.IsNullOrEmpty(permissionDefinition.Parent)
                    ? GetPermissionOrNull(permissionDefinition.Parent)
                    : null;

                parent?.RemoveChildPermission(oldName);

                var newPermission = await CreatePermissionInternalAsync(permissionDefinition);

                await _permissionDefinitionRepository.InsertOrUpdateAsync(dbPermission);

                Permissions.AddAllPermissions();

                return newPermission;
            }

            return GetPermissionOrNull(oldName);
        }

        public async Task UpdateParentAsync(string name, string? parentName, Module? module)
        {
            var dbPermission = _permissionDefinitionRepository.GetAll().FirstOrDefault(x => x.Name == name);

            if (dbPermission == null)
            {
                DeleteMissedDbPermission(name);
                throw new EntityNotFoundException("Permission 'name' not found");
            }

            InternalDeletePermission(dbPermission);

            dbPermission.Parent = parentName;
            dbPermission.Module = module;
            await CreatePermissionInternalAsync(dbPermission);
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

            var p = GetPermissionOrNull(permission.Name);
            if (p != null) 
                RemovePermission(permission.Name);
        }

        public async Task DeletePermissionAsync(string name)
        {
            var dbPermission = _permissionDefinitionRepository.GetAll().FirstOrDefault(x => x.Name == name);

            if (dbPermission == null)
            {
                DeleteMissedDbPermission(name);
                throw new EntityNotFoundException("Permission 'name' not found");
            }

            var child = _permissionDefinitionRepository.GetAll().Where(x => x.Parent == name);
            foreach (var item in child)
            {
                await DeletePermissionAsync(item.Name);
            }

            InternalDeletePermission(dbPermission);

            if (dbPermission != null)
                await _permissionDefinitionRepository.DeleteAsync(dbPermission);
        }

        private void DeleteMissedDbPermission(string name)
        {
            var permission = GetPermissionOrNull(name);
            if (permission != null
                && permission.Properties != null 
                && permission.Properties.ContainsKey(IsDbPermission) 
                && (bool)permission.Properties[IsDbPermission])
            {
                RemovePermission(name);
            }
        }

        public override void RemovePermission(string name)
        {
            Abp.Authorization.Permission? parent = null;
            var permissions = GetAllPermissions();
            foreach (var permission in permissions)
            {
                if (permission.Children.Any(x => x.Name == name))
                {
                    parent = permission;
                    break;
                }
            }

            if (parent != null)
            {
                parent?.RemoveChildPermission(name);
            }

            var p = GetPermissionOrNull(name);
            if (p != null)
                base.RemovePermission(name);
        }
    }
}