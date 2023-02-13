using System.ComponentModel;
using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Core", "NotificationTemplateFormat")]
    public enum RefListNotificationTemplateType
    {
        [Description("Plain Text")]
        PlainText = 0,

        Html = 1
    }
}
