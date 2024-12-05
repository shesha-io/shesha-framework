using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Core", "NotificationReadStatus")]
    public enum RefListNotificationReadStatus: long
    {
        Unread = 0,
        Read = 1
    }
}
