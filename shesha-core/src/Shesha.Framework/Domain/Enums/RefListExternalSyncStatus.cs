using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Framework", "ExternalSyncStatus")]
    public enum RefListExternalSyncStatus
    {
        AwaitingSync = 1,
        Synced = 2,
        SyncError = 3
    }
}