using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.ObjectMapping;
using Shesha.Bootstrappers;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Extensions;
using Shesha.Permissions;
using Shesha.Services.VersionedFields;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Permission
{
    [DependsOnBootstrapper(typeof(ConfigurableModuleBootstrapper))]
    public class PermissionedObjectsBootstrapper : IBootstrapper, ITransientDependency
    {
        private readonly IRepository<PermissionedObject, Guid> _permissionedObjectRepository;
        private readonly IObjectMapper _objectMapper;
        private readonly IVersionedFieldManager _versionedFieldManager;
        private readonly IRepository<Module, Guid> _moduleReporsitory;
        private readonly IIocResolver _iocResolver;

        public PermissionedObjectsBootstrapper(
            IRepository<PermissionedObject, Guid> permissionedObjectRepository,
            IObjectMapper objectMapper,
            IVersionedFieldManager versionedFieldManager,
            IRepository<Module, Guid> moduleReporsitory,
            IIocResolver iocResolver
        )
        {
            _permissionedObjectRepository = permissionedObjectRepository;
            _objectMapper = objectMapper;
            _versionedFieldManager = versionedFieldManager;
            _moduleReporsitory = moduleReporsitory;
            _iocResolver = iocResolver;
        }

        public async Task ProcessAsync()
        {
            var providers = _iocResolver.ResolveAll<IPermissionedObjectProvider>();
            foreach (var permissionedObjectProvider in providers)
            {
                var objectTypes = permissionedObjectProvider.GetObjectTypes();

                foreach (var objectType in objectTypes)
                {

                    var items = await permissionedObjectProvider.GetAllAsync(objectType, true);

                    var dbItems = await _permissionedObjectRepository.GetAll()
                        .Where(x => x.Type == objectType || x.Type.Contains($"{objectType}.")).ToListAsync();

                    // Add news items
                    var toAdd = items.Where(i => dbItems.All(dbi => dbi.Object != i.Object))
                        .ToList();
                    foreach (var item in toAdd)
                    {
                        var dbItem = _objectMapper.Map<PermissionedObject>(item);
                        dbItem.Module = await _moduleReporsitory.FirstOrDefaultAsync(x => x.Id == item.ModuleId);
                        var obj = await _permissionedObjectRepository.InsertAsync(dbItem);
                        foreach (var parameter in item.AdditionalParameters)
                        {
                            await _versionedFieldManager.SetVersionedFieldValueAsync<PermissionedObject, Guid>(obj, parameter.Key, parameter.Value, false);
                        }
                    }

                    // Update items
                    var toUpdate = dbItems.Where(dbi => items.Any(i => dbi.Object == i.Object && dbi.Md5 != i.Md5)).ToList();
                    foreach (var dbItem in toUpdate)
                    {
                        var item = items.FirstOrDefault(x => x.Object == dbItem.Object);
                        if (item == null) continue;
                        dbItem.Module = await _moduleReporsitory.FirstOrDefaultAsync(x => x.Id == item.ModuleId);
                        dbItem.Parent = item.Parent;
                        dbItem.Name = item.Name;
                        if (dbItem.Hardcoded.HasValue && (item.Hardcoded == true || item.Hardcoded != dbItem.Hardcoded))
                        {
                            dbItem.Access = item.Access ?? Domain.Enums.RefListPermissionedAccess.Inherited;
                            dbItem.Permissions = string.Join(",", item.Permissions);
                        }
                        dbItem.Hardcoded = item.Hardcoded ?? false;

                        dbItem.Md5 = item.Md5;
                        await _permissionedObjectRepository.UpdateAsync(dbItem);
                        foreach (var parameter in item.AdditionalParameters)
                        {
                            await _versionedFieldManager.SetVersionedFieldValueAsync<PermissionedObject, Guid>(dbItem, parameter.Key, parameter.Value, false);
                        }
                    }

                    // TODO: AS - think how to inactivate deleted items take into account skipped Assembly
                    // Inactivate deleted items
                    /*var toDelete = dbItems.Where(dbi => items.All(i => dbi.Object != i.Object)).ToList();
                    foreach (var item in toDelete)
                    {
                        await _permissionedObjectRepository.DeleteAsync(item);
                    }*/
                }
            }
            
            // todo: write changelog
        }
    }
}
