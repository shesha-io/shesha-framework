using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Core", "NotificationMessageFormat")]
    public enum RefListNotificationMessageFormat : long
    {
        PlainText = 1,
        RichText = 2,
        EnhancedText = 3,
        // Add other formats as needed
    }
}
