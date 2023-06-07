using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Core", "NotificationDirection")]
    public enum RefListNotificationDirection
    {
        Incoming = 1,
        Outgoing = 2
    }
}
