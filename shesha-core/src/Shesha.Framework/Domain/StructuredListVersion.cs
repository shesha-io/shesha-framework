using Abp.Domain.Entities.Auditing;
using Newtonsoft.Json;
using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;

namespace Shesha.Domain
{
    /// <summary>
    /// Structured List Version
    /// </summary>
    [Entity(TypeShortAlias = "Shesha.Framework.StructuredListVersion", GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class StructuredListVersion : FullAuditedEntity<Guid>
    {
        /// <summary>
        /// Constructor
        /// </summary>
        public StructuredListVersion()
        {
            Items = new List<StructuredListItem>();
        }

        /// <summary>
        /// Owning structured list
        /// </summary>
        [JsonIgnore]
        public virtual StructuredList StructuredList { get; set; }

        /// <summary>
        /// True if the version is last. Value of this field is managed by DB triggers.
        /// </summary>
        public virtual bool IsLast { get; protected set; }

        /// <summary>
        /// List heading (shown before the list items)
        /// </summary>
        public virtual string Heading { get; set; }

        /// <summary>
        /// Items
        /// </summary>
        public virtual IList<StructuredListItem> Items { get; protected set; }
    }
}
