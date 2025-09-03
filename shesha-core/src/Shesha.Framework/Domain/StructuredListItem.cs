using Abp.Domain.Entities.Auditing;
using Newtonsoft.Json;
using Shesha.Domain.Attributes;
using System;

namespace Shesha.Domain
{
    /// <summary>
    /// Structured List Item
    /// </summary>
    [Entity(TypeShortAlias = "Shesha.Framework.StructuredListItem", GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class StructuredListItem : FullAuditedEntity<Guid>
    {
        /// <summary>
        /// Owning structured list version
        /// </summary>
        [JsonIgnore]
        public virtual StructuredListVersion StructuredListVersion { get; set; }

        /// <summary>
        /// An item from previous version that this item was copied from
        /// </summary>
        [JsonIgnore]
        public virtual StructuredListItem PreviousVersionItem { get; set; }

        /// <summary>
        /// Item text
        /// </summary>
        public virtual string ItemText { get; set; }

        /// <summary>
        /// Item checkbox value
        /// </summary>
        public virtual bool ItemChecked { get; set; }

        /// <summary>
        /// Mandatory items cannot be deleted
        /// </summary>
        public virtual bool? IsMandatory { get; set; }

        /// <summary>
        /// Sort order
        /// </summary>
        public virtual long SortOrder { get; set; }
    }
}
