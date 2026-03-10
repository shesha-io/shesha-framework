using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    [ReferenceList("NotificationMessageFormat")]
    public enum RefListNotificationMessageFormat : long
    {
        PlainText = 1,
        RichText = 2,
        EnhancedText = 3,
    }
}
