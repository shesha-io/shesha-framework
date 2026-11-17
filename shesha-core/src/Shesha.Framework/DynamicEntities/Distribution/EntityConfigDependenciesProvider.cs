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

            var objectNames = new[]
            {
                fullClassName,
                $"{fullClassName}@Get",
                $"{fullClassName}@Create",
                $"{fullClassName}@Update",
                $"{fullClassName}@Delete",
            };

            var permissionNames = new HashSet<string>();
            foreach (var objectName in objectNames)
            {
                var permissionedObject = await _permissionedObjectManager.GetOrNullAsync(objectName, null);
                if (permissionedObject?.Permissions != null)
                    foreach (var permissionName in permissionedObject.Permissions)
                        permissionNames.Add(permissionName);
            }

            var result = new List<ConfigurationItemIdentifier>();
            foreach (var permissionName in permissionNames)
            {
                var definition = await _permissionDefinitionRepo.FirstOrDefaultAsync(p => p.Name == permissionName);
                if (definition != null)
                    result.Add(new PermissionDefinitionIdentifier(definition.Module?.Name, definition.Name));
            }

            return result;
        }
    }
}
