using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;

namespace Shesha.Domain
{
    [Entity(
        FriendlyName = "Permission",
        TypeShortAlias = "Shesha.Framework.PermissionDefinition", 
        CrudActions = CrudActions.None, 
        IsConfigurable = false
    )]
    [JoinedProperty("permission_definitions", Schema = "frwk")]
    [DiscriminatorValue(ItemTypeName)]
    [SnakeCaseNaming]
    public class PermissionDefinition : ConfigurationItem
    {
        public const string ItemTypeName = "permission-definition";
        public override string ItemType => ItemTypeName;

        /// <summary>
        /// Parent of this permission if one exists.
        /// </summary>
        public virtual string? Parent { get; set; }
    }
}