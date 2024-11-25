using Shesha.Domain;
using Shesha.Notifications.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.OmoNotifications
{
    public interface INotificationSender
    {
        Task SendAsync(Person fromPerson, Person toPerson, OmoNotificationMessage message, bool isBodyHtml);
    }
}
