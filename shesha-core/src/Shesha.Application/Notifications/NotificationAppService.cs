using Abp;
using Abp.BackgroundJobs;
using Abp.Configuration;
using Abp.Domain.Repositories;
using Abp.Notifications;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.EntityReferences;
using Shesha.Notifications.Configuration;
using Shesha.Notifications.Dto;
using Shesha.Services;
using Shesha.Services.StoredFiles;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
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

        public async Task PublishAsync(NotificationTypeConfig type, long priority, NotificationData data, Person recipient, GenericEntityReference triggeringEntity = null)
        {
            if (recipient == null)
                throw new Exception($"{nameof(recipient)} must not be null");

            var sender = await GetCurrentPersonAsync();

            await _notificationService.SendNotification(type, sender, recipient, data, (RefListNotificationPriority)priority, null, triggeringEntity);
        }
    }
}