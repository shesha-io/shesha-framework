using Shesha.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Services.ReferenceLists.Distribution
{
    /// <summary>
    /// Reference list distribution helper
    /// </summary>
    public interface IReferenceListDistributionHelper
    {
        /// <summary>
        /// Export reference list items
        /// </summary>
        Task<List<DistributedReferenceListItem>> ExportRefListItemsAsync(ReferenceList refList);

        /// <summary>
        /// Compare reference list items
        /// </summary>
        bool ItemsAreEqual(List<DistributedReferenceListItem> itemsA, List<DistributedReferenceListItem> itemsB);
    }
}
