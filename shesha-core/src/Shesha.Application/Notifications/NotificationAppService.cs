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
    public class NotificationAppService: SheshaAppServiceBase
    {
        private readonly INotificationSender _notificationService;
        private readonly IRepository<NotificationChannelConfig, Guid> _notificationChannelRepository;
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<NotificationTypeConfig, Guid> _notificationTypeRepository;
        private readonly IStoredFileService _storedFileService;

        public NotificationAppService(INotificationSender notificationService, IRepository<NotificationChannelConfig, Guid> notificationChannelRepository, IRepository<Person, Guid> personRepository, IRepository<NotificationTypeConfig, Guid> notificationType, IStoredFileService storedFileService)
        {
            _notificationChannelRepository = notificationChannelRepository;
            _notificationService = notificationService;
            _personRepository = personRepository;
            _notificationTypeRepository = notificationType;
            _storedFileService = storedFileService;
        }

        public async Task TestNotificationAsync(NotificationDto notification)
        {
            // Fetch notification type details
            var type = await _notificationTypeRepository.FirstOrDefaultAsync(notification.type.Id);
            if (type == null)
                throw new ArgumentException($"Notification type with ID {notification.type.Id} does not exist.");
            // Get recipient details
            var recipient = await _personRepository.FirstOrDefaultAsync(notification.recipient.Id);
            if (recipient == null)
                throw new ArgumentException($"Recipient with ID {notification.recipient.Id} does not exist.");
            // Get channel details
            var channel = notification.channel != null  ? await _notificationChannelRepository.FirstOrDefaultAsync(notification.channel.Id) : null;
            // Prepare notification data
            var data = new TestData()
            {
                name = recipient.FullName,
                subject = type.Name,
                body = type.Description
            };

            var getAttachments = await _storedFileService.GetAttachmentsAsync(recipient.Id, "Shesha.Domain.Person");
            var attachments = getAttachments.Select(x => new NotificationAttachmentDto()
            {
                FileName = x.FileName,
                StoredFileId = x.Id,
            }).ToList();

            var sender = await GetCurrentPersonAsync();
            if (sender == null)
                throw new InvalidOperationException("Current person could not be determined. Ensure the user is logged in.");

            await _notificationService.SendNotification(
                type,
                sender,
                recipient,
                data,
                (RefListNotificationPriority)notification.priority,
                attachments,
                null,
                channel
            );
        }

        public async Task BulkPublishAsync (BulkNotificationDto notification)
        {
            if(notification.recipients == null || notification.recipients.Count == 0)
                throw new ArgumentException("Recipients must not be null or empty.");
            // Fetch notification type details
            var type = await _notificationTypeRepository.FirstOrDefaultAsync(notification.type.Id);
            if (type == null)
                throw new ArgumentException($"Notification type with ID {notification.type.Id} does not exist.");
            // Get channel details
            var channel = notification.channel != null ? await _notificationChannelRepository.FirstOrDefaultAsync(notification.channel.Id) : null;
            // Prepare notification data
            var data = new TestData()
            {
                name = "Test Name",
            };
            // Get the current person
            var sender = await GetCurrentPersonAsync();
            if (sender == null)
                throw new InvalidOperationException("Current person could not be determined. Ensure the user is logged in.");
            // Send notification to each recipient
            foreach (var reciever in notification.recipients)
            {
                var recipient = await _personRepository.FirstOrDefaultAsync(reciever.Id);
                if (recipient == null)
                    throw new Exception($"{nameof(recipient)} must not be null");

                await _notificationService.SendNotification(
                    type,
                    sender,
                    recipient, 
                    data,
                    (RefListNotificationPriority)notification.priority,
                    null,
                    null,
                    channel
                 );
            }
        }
    }
}
