using Shesha.Domain.Attributes;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace Shesha.Domain
{
    /// <summary>
    /// Structured versioned list of text items
    /// </summary>
    [Entity(TypeShortAlias = "Shesha.Framework.StructuredList", GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class StructuredList : FullPowerChildEntity
    {
        /// <summary>
        /// Category. Used to attach more than one links list to the entity.
        /// </summary>
        public virtual string Category { get; set; }

        /// <summary>
        /// Versions
        /// </summary>
        public virtual IList<StructuredListVersion> Versions { get; protected set; } = new List<StructuredListVersion>();

        /// <summary>
        /// Last version
        /// </summary>
        [NotMapped]
        public virtual StructuredListVersion LastVersion => Versions.FirstOrDefault(v => v.IsLast);
    }
}
