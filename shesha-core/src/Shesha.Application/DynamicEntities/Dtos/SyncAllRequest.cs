using DocumentFormat.OpenXml.Office2010.ExcelAc;
using System.Collections.Generic;

namespace Shesha.DynamicEntities.Dtos
{
    /// <summary>
    /// Sync client configurations request
    /// </summary>
    public class SyncAllRequest
    {
        public List<ModuleSyncRequest> Modules { get; set; } = new List<ModuleSyncRequest>();
    }
}
