using System.Collections;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Shesha.DynamicEntities.Dtos
{
    /// <summary>
    /// Entities reordering response
    /// </summary>
    public class ReorderResponse<TId, TOrderIndex>: IReorderResponse
    {
        /*
        /// <summary>
        /// Reordered items
        /// </summary>
        public List<ReorderingItem<TId, TOrderIndex>> Items { get; set; } = new List<ReorderingItem<TId, TOrderIndex>>();
        */
        [JsonIgnore]
        public Dictionary<TId, TOrderIndex> ReorderedItems { get; } = new Dictionary<TId, TOrderIndex>();

        public IDictionary Items => ReorderedItems;
    }

    public interface IReorderResponse 
    {
        IDictionary Items { get; }
    }
}
