using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    [ReferenceList("NotificationChannelStatus")]
    public enum RefListNotificationChannelStatus : long
    {
        Enabled = 1,
        Disabled = 2,
        Suppressed = 3,
    }
}
