using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Reflection;
using NHibernate.Linq;
using Shesha.Bootstrappers;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Metadata;
using Shesha.Metadata.Dtos;
using Shesha.Reflection;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Abp.Authorization;
using Abp.Domain.Uow;
using Abp.ObjectMapping;
using Shesha.Authorization;
using Shesha.Permissions;

namespace Shesha.Permission
{
    public class PermissionDefinitionsBootstrapper : IBootstrapper, ITransientDependency
    {
        private readonly IShaPermissionManager _permissionManager;
        private readonly IRepository<PermissionDefinition, Guid> _permissionDefinitionRepository;

        public PermissionDefinitionsBootstrapper(IShaPermissionManager permissionManager, IRepository<PermissionDefinition, Guid> permissionDefinitionRepository)
        {
            _permissionManager = permissionManager;
            _permissionDefinitionRepository = permissionDefinitionRepository;
        }

        public async Task Process()
        {
            await SetPermissionsAsync();
            // todo: write changelog
        }

        [UnitOfWork]
        public async Task SetPermissionsAsync()
        {
            var dbPermissions = _permissionDefinitionRepository.GetAllList();

            // Update DB-related items
            var dbRootPermissions = dbPermissions.Where(x => string.IsNullOrEmpty(x.Parent)).ToList();
            foreach (var dbPermission in dbRootPermissions)
            {
                var permission = await _permissionManager.CreatePermissionAsync(dbPermission);
                await CreateChildPermissionsAsync(dbPermissions, permission);
                dbPermissions.Remove(dbPermission);
            }


            // Update code-related items
            while (dbPermissions.Any())
            {
                var dbPermission = dbPermissions.FirstOrDefault();
                if (dbPermission != null)
                {
                    var permission = _permissionManager.GetPermissionOrNull(dbPermission.Parent);
                    while (permission == null && dbPermissions.Any(x => x.Name == dbPermission?.Parent))
                    {
                        dbPermission = dbPermissions.FirstOrDefault(x => x.Name == dbPermission?.Parent);
                        permission = _permissionManager.GetPermissionOrNull(dbPermission?.Parent);
                    }

                    if (permission != null)
                    {
                        await CreateChildPermissionsAsync(dbPermissions, permission);
                    }
                    else
                    {
                        // remove permission with missed parent
                        _permissionDefinitionRepository.Delete(dbPermission);
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
                var childPermission = await _permissionManager.CreatePermissionAsync(dbChildPermission);
                await CreateChildPermissionsAsync(dbPermissions, childPermission);
                dbPermissions.Remove(dbChildPermission);
            }
        }

    }
}
