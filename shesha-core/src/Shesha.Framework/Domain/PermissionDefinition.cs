using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Framework.PermissionDefinition", GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
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