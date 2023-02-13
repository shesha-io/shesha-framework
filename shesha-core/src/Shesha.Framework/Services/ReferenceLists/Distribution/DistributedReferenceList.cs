using Shesha.ConfigurationItems.Distribution;
using System;
using System.Collections.Generic;

namespace Shesha.Services.ReferenceLists.Distribution
{
    /// <summary>
    /// Distributed reference list
    /// </summary>
    public class DistributedReferenceList: DistributedConfigurableItemBase
    {
        /// <summary>
        /// List items
        /// </summary>
        public List<DistributedReferenceListItem> Items { get; set; } = new List<DistributedReferenceListItem>();
    }
}
