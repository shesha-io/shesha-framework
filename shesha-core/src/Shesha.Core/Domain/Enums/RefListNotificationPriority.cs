using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Core", "NotificationPriority")]
    public enum RefListNotificationPriority : long
    {
        High = 1,
        Medium = 2,
        Low = 3,
        Deferred = 4
    }
}
