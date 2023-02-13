using System;
using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    [Flags]
    [ReferenceList("Shesha.Core", "NotificationSendType")]
    public enum RefListNotificationType
    {
        None = 0,
        Email = 1,
        SMS = 2,
        Push = 3
    }
}
