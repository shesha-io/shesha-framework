using System.Runtime.Serialization;

namespace Shesha.DynamicEntities.Dtos
{
    public enum SyncStatus
    {
        [EnumMember(Value = "uptodate")]
        UpToDate,
        [EnumMember(Value = "outofdate")]
        OutOfDate,
        [EnumMember(Value = "unknown")]
        Unknown,        
    }
}
