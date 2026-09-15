using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    /// <summary>
    /// Manifest of custom (hand-coded) API endpoint permission configuration for a single module.
    /// Its payload is not stored on this row -- it is the module's <see cref="PermissionedObject"/>
    /// rows of type <see cref="Shesha.Permissions.ShaPermissionedObjectsTypes.WebApi"/> and
    /// <see cref="Shesha.Permissions.ShaPermissionedObjectsTypes.WebApiAction"/>, read live at export
    /// time and applied onto those rows at import time.
    /// </summary>
    [Entity(TypeShortAlias = "Shesha.Framework.ApiPermissionsManifest", GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    [JoinedProperty("Frwk_ApiPermissionsManifests")]
    [DiscriminatorValue(ItemTypeName)]
    public class ApiPermissionsManifest : ConfigurationItemBase
    {
        public const string ItemTypeName = "api-permissions-manifest";

        /// <summary>
        /// Fixed name used for the single manifest item of each module
        /// </summary>
        public const string ManifestName = "api-permissions";

        public override string ItemType => ItemTypeName;
    }
}
