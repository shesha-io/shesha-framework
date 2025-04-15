using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    [ReferenceList("NotificationReadStatus")]
    public enum RefListNotificationReadStatus: long
    {
        Unread = 0,
        Read = 1
    }
}
