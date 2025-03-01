using System.Collections;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Shesha.DynamicEntities.Dtos
{
    /// <summary>
    /// Entities reordering response
    /// </summary>
    public class ReorderResponse<TId, TOrderIndex>: IReorderResponse where TId : notnull
    {
        [JsonIgnore]
        public Dictionary<TId, TOrderIndex> ReorderedItems { get; } = [];

        public IDictionary Items => ReorderedItems;
    }

    public interface IReorderResponse 
    {
        IDictionary Items { get; }
    }
}
