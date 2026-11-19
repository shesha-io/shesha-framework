using Abp.Domain.Repositories;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Extensions;
using Shesha.Permissions;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Distribution
{
    /// <summary>Reports an entity's referenced custom permissions as dependencies, so exporting with dependencies includes them too.</summary>
    public class EntityConfigDependenciesProvider : DependenciesProvider<EntityConfig>
    {
        private readonly IPermissionedObjectManager _permissionedObjectManager;
        private readonly IRepository<PermissionDefinition, System.Guid> _permissionDefinitionRepo;

        public EntityConfigDependenciesProvider(
            IPermissionedObjectManager permissionedObjectManager,
            IRepository<PermissionDefinition, System.Guid> permissionDefinitionRepo
        )
        {
            _permissionedObjectManager = permissionedObjectManager;
            _permissionDefinitionRepo = permissionDefinitionRepo;
        }

        public override async Task<IList<ConfigurationItemIdentifier>> GetReferencedItemsTypedAsync(EntityConfig item)
        {
            var fullClassName = $"{item.Namespace}.{item.ClassName}";

            var objectsAndTypes = new[]
            {
                (Object: fullClassName, Type: ShaPermissionedObjectsTypes.Entity),
                (Object: $"{fullClassName}@Get", Type: ShaPermissionedObjectsTypes.EntityAction),
                (Object: $"{fullClassName}@Create", Type: ShaPermissionedObjectsTypes.EntityAction),
                (Object: $"{fullClassName}@Update", Type: ShaPermissionedObjectsTypes.EntityAction),
                (Object: $"{fullClassName}@Delete", Type: ShaPermissionedObjectsTypes.EntityAction),
            };

            var permissionNames = new HashSet<string>();
            foreach (var (objectName, objectType) in objectsAndTypes)
            {
                var permissionedObject = await _permissionedObjectManager.GetOrNullAsync(objectName, objectType);
                if (permissionedObject?.Permissions != null)
                    foreach (var permissionName in permissionedObject.Permissions)
                        permissionNames.Add(permissionName);
            }

            var visited = new HashSet<string>();
            var result = new List<ConfigurationItemIdentifier>();
            foreach (var permissionName in permissionNames)
                await AddWithAncestorsAsync(permissionName, visited, result);

            return result;
        }

        // Adds a permission and its full ancestor chain, or nothing if any ancestor has no live version.
        private async Task AddWithAncestorsAsync(string permissionName, HashSet<string> visited, List<ConfigurationItemIdentifier> result)
        {
            if (visited.Contains(permissionName))
                return;

            var chain = new List<PermissionDefinition>();
            var chainNames = new HashSet<string>();
            var name = permissionName;
            while (!string.IsNullOrWhiteSpace(name))
            {
                if (!chainNames.Add(name))
                {
                    // cyclic Parent chain - can't be rooted, so drop it rather than export unreachable items
                    foreach (var droppedName in chainNames)
                        visited.Add(droppedName);
                    return;
                }

                var definition = await _permissionDefinitionRepo.GetAll()
                    .Where(p => p.Name == name && p.VersionStatus == ConfigurationItemVersionStatus.Live)
                    .FirstOrDefaultAsync();
                if (definition == null)
                {
                    foreach (var droppedName in chainNames)
                        visited.Add(droppedName);
                    return;
                }

                chain.Add(definition);
                name = definition.Parent;
            }

            foreach (var definition in chain)
            {
                if (visited.Add(definition.Name))
                    result.Add(new PermissionDefinitionIdentifier(definition.Module?.Name, definition.Name));
            }
        }
    }
}
