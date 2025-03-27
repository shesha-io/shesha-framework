using Abp.Notifications;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.EntityReferences;
using System;
using System.Threading.Tasks;

namespace Shesha.Notifications
{
    public class NotificationAppService : SheshaAppServiceBase
    {
        private readonly INotificationSender _notificationService;

        public NotificationAppService(INotificationSender notificationService)
        {
            _notificationService = notificationService;
        }

        public async Task PublishAsync(NotificationTypeConfig type, long priority, NotificationData data, Person recipient, string cc = "", GenericEntityReference? triggeringEntity = null)
        {
            if (recipient == null)
                throw new Exception($"{nameof(recipient)} must not be null");

            var sender = await GetCurrentPersonAsync();

            await _notificationService.SendNotificationAsync(type, sender, recipient, data, (RefListNotificationPriority)priority, null, cc, triggeringEntity);
        }
    }
}