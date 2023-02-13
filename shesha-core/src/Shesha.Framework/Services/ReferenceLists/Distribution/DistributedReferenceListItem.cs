using System;
using System.Collections.Generic;

namespace Shesha.Services.ReferenceLists.Distribution
{
    /// <summary>
    /// Distributed reference list item
    /// </summary>
    public class DistributedReferenceListItem
    {
        /// <summary>
        /// Item text
        /// </summary>
        public string Item { get; set; }

        /// <summary>
        /// Item value
        /// </summary>
        public Int64 ItemValue { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Order index
        /// </summary>
        public Int64 OrderIndex { get; set; }

        /// <summary>
        /// If true, indicates that this item is hardly linked to the application code
        /// </summary>
        public bool HardLinkToApplication { get; set; }

        /// <summary>
        /// Assicoated color
        /// </summary>
        public string Color { get; set; }

        /// <summary>
        /// Assiciated icon
        /// </summary>
        public string Icon { get; set; }

        /// <summary>
        /// Short alias
        /// </summary>
        public string ShortAlias { get; set; }

        /// <summary>
        /// Child items
        /// </summary>
        public List<DistributedReferenceListItem> ChildItems { get; set; } = new List<DistributedReferenceListItem>();
    }
}
