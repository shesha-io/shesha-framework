using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    [ReferenceList("NotificationPriority")]
    public enum RefListNotificationPriority : long
    {
        High = 1,
        Medium = 2,
        Low = 3,
        Deferred = 4
    }
}
