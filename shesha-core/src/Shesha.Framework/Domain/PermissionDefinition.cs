using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [Entity(
        FriendlyName = "Permission",
        TypeShortAlias = "Shesha.Framework.PermissionDefinition", 
        GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService
    )]
    [JoinedProperty("permission_definitions", Schema = "frwk")]
    [DiscriminatorValue(ItemTypeName)]
    [SnakeCaseNaming]
    public class PermissionDefinition : ConfigurationItem
    {
        public const string ItemTypeName = "permission-definition";

        /// <summary>
        /// Parent of this permission if one exists.
        /// </summary>
        public virtual string? Parent { get; set; }
    }
}