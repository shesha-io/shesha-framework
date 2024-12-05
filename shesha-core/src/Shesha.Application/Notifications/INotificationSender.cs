using Shesha.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Notifications
{
    public interface INotificationSender
    {
        Task SendAsync(Person fromPerson, Person toPerson, NotificationMessage message, bool isBodyHtml);
    }
}
