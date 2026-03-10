using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    /// <summary>
    /// Folder that contains <see cref="ConfigurationItem"/>. Is used for logical organisation of items
    /// </summary>
    [SnakeCaseNaming]
    [Table("configuration_item_folders", Schema = "frwk")]
    [Entity(GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class ConfigurationItemFolder : FullAuditedEntity<Guid>
    {
        /// <summary>
        /// Folder name
        /// </summary>
        [MaxLength(300)]
        public virtual string Name { get; set; } = string.Empty;

        /// <summary>
        /// Folder description
        /// </summary>
        public virtual string Description { get; set; } = string.Empty;

        /// <summary>
        /// Parent folder
        /// </summary>
        public virtual ConfigurationItemFolder? Parent { get; set; }

        /// <summary>
        /// Module current folder belongs to
        /// </summary>
        public required virtual Module Module { get; set; }
    }
}