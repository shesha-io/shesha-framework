using Shesha.Domain.Attributes;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    /// <summary>
    /// Entity property value (initially for Dynamic properties)
    /// </summary>
    [Entity(TypeShortAlias = "Shesha.Framework.EntityPropertyValue", GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    [SnakeCaseNaming]
    [Table("entity_property_values", Schema = "frwk")]
    public class EntityPropertyValue : FullPowerChildEntity
    {
        /// <summary>
        /// Owner entity property
        /// </summary>
        public required virtual EntityProperty EntityProperty { get; set; }

        /// <summary>
        /// Property value
        /// </summary>
        public virtual string? Value { get; set; }

        /// <summary>
        /// Owning entity ID. ID is intentionally bigger because in some cases an owner ID is set to a data table ID string
        /// </summary>
        [Column("frwk_owner_id"), StringLength(255)]
        public override string? OwnerId { get; set; }

        /// <summary>
        /// Owning entity type alias
        /// </summary>
        [Column("frwk_owner_type"), StringLength(100)]
        public override string? OwnerType { get; set; }
    }
}
