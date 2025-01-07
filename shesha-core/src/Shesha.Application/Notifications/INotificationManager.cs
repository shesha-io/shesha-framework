using Shesha.Domain.Enums;
using Shesha.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Notifications
{
    public interface INotificationManager
    {
        Task<List<NotificationChannelConfig>> GetChannelsAsync(NotificationTypeConfig type, Person recipient, RefListNotificationPriority priority);
    }
}
