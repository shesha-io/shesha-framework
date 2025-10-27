using Shesha.Domain.Attributes;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    /// <summary>
    /// Versioned field definition
    /// </summary>
    [SnakeCaseNaming]
    [Table("versioned_fields", Schema = "frwk")]
    [Entity(GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class VersionedField : FullPowerChildEntity
    {
        /// <summary>
        /// Field name
        /// </summary>
        [MaxLength(1023)]
        public virtual string Name { get; set; }

        /// <summary>
        /// Defines whether full versions history is tracked and stored or not
        /// </summary>
        public virtual bool TrackVersions { get; set; }

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
