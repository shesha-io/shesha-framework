using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    /// <summary>
    /// Form configuration dependency
    /// </summary>
    [Table("form_configuration_dependencies", Schema = "frwk")]
    [SnakeCaseNaming]
    public class FormConfigurationDependency: Entity<Guid>
    {
        /// <summary>
        /// Form configuration that owns this dependency
        /// </summary>
        public virtual FormConfiguration Form { get; set; }

        /// <summary>
        /// Dependency type (e.g. component, form, reference list etc)
        /// </summary>
        [StringLength(100)]
        public virtual string Type { get; set; }

        /// <summary>
        /// Module or the referenced item (if applicable)
        /// </summary>
        [StringLength(200)]
        public virtual string? Module { get; set; }

        /// <summary>
        /// Name or unique identifier of referenced object
        /// </summary>
        [StringLength(200)]
        public virtual string Name { get; set; }

        /// <summary>
        /// Whether the dependency is satisfied
        /// </summary>
        public virtual bool IsSatisfied { get; set; }

        /// <summary>
        /// Whether the dependency has validation issues
        /// </summary>
        public virtual bool HasIssues { get; set; }
    }
}
