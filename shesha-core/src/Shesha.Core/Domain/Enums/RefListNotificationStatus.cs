using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Core", "NotificationStatus")]
    public enum RefListNotificationStatus
    {
        Unknown = 0,
        Sent = 1,
        Outgoing = 2,
        WaitToRetry = 4,
        Failed = 8,
        Preparing = 16
    }
}
