using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Framework.PermissionDefinition", CrudActions = CrudActions.None, IsConfigurable = false)]
    [JoinedProperty("Frwk_PermissionDefinitions")]
    [DiscriminatorValue(ItemTypeName)]
    public class PermissionDefinition : ConfigurationItemBase
    {
        public const string ItemTypeName = "permission-definition";

        /// <summary>
        /// Parent of this permission if one exists.
        /// </summary>
        public virtual string Parent { get; set; }
    }
}