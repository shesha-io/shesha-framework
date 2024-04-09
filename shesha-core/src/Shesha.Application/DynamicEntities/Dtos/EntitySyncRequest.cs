using System;

namespace Shesha.DynamicEntities.Dtos
{
    /// <summary>
    /// Entity sync request
    /// </summary>
    public class EntitySyncRequest
    {
        public string Accessor { get; set; }
        public string Md5 { get; set; }
        public DateTime ChangeTime { get; set; }
    }
}
