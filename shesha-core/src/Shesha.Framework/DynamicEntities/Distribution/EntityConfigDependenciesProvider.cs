using Abp.Domain.Repositories;
using Shesha.ConfigurationItems;
using Shesha.Domain;
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

        private async Task AddWithAncestorsAsync(string permissionName, HashSet<string> visited, List<ConfigurationItemIdentifier> result)
        {
            if (!visited.Add(permissionName))
                return;

            var definition = await _permissionDefinitionRepo.FirstOrDefaultAsync(p => p.Name == permissionName);
            if (definition == null)
                return;

            result.Add(new PermissionDefinitionIdentifier(definition.Module?.Name, definition.Name));

            if (!string.IsNullOrWhiteSpace(definition.Parent))
                await AddWithAncestorsAsync(definition.Parent, visited, result);
        }
    }
}
