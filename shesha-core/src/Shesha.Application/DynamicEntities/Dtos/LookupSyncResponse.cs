using System.Collections.Generic;

namespace Shesha.DynamicEntities.Dtos
{
    public class LookupSyncResponse
    {
        public string Module { get; set; }

        public string Name { get; set; }

        public List<LookupItemSyncResponse> Items { get; set; } = new List<LookupItemSyncResponse>();
    }
}
