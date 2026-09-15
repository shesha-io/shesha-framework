using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain.Enums;
using System.Collections.Generic;

namespace Shesha.Permissions.Distribution.Dto
{
    /// <summary>
    /// Distributed manifest of custom API endpoint permission configuration for a single module
    /// </summary>
    public class DistributedApiPermissionsManifest : DistributedConfigurableItemBase
    {
        public List<DistributedPermissionedObject> Items { get; set; } = new List<DistributedPermissionedObject>();
    }

    /// <summary>
    /// A single exported <see cref="Shesha.Domain.PermissionedObject"/> row of type
    /// <see cref="ShaPermissionedObjectsTypes.WebApi"/> or <see cref="ShaPermissionedObjectsTypes.WebApiAction"/>
    /// </summary>
    public class DistributedPermissionedObject
    {
        /// <summary>
        /// Text identifier of the object (e.g. the full name of the controller/service class, or `Class@Method` for actions)
        /// </summary>
        public string Object { get; set; }

        /// <summary>
        /// Type of the permissioned object. Must be preserved exactly on import -- <see cref="IPermissionedObjectManager.SetAsync"/>
        /// matches existing rows on (Object, Type), so writing the wrong Type creates a duplicate row instead of updating the
        /// existing one, and the runtime lookup (which also filters by Type) then misses it.
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// Name for display in the configurator
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Description for display in the configurator
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Text identifier of the parent object (for action rows, the owning service/controller object)
        /// </summary>
        public string Parent { get; set; }

        /// <summary>
        /// Access type
        /// </summary>
        public RefListPermissionedAccess? Access { get; set; }

        /// <summary>
        /// List of permissions required to access this securable
        /// </summary>
        public List<string> Permissions { get; set; } = new List<string>();

        public bool Hidden { get; set; }
    }
}
