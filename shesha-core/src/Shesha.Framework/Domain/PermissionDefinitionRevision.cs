using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [JoinedProperty("permission_definition_revisions", Schema = "frwk")]
    [SnakeCaseNaming]
    [DiscriminatorValue(PermissionDefinition.ItemTypeName)]
    public class PermissionDefinitionRevision : ConfigurationItemRevision
    {
        /// <summary>
        /// Parent of this permission if one exists.
        /// </summary>
        public virtual string? Parent { get; set; }
    }
}
