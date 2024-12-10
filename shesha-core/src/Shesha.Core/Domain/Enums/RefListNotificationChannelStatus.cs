using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
