using Abp.Domain.Repositories;
using Boxfusion.SheshaFunctionalTests.Common.Application.Services.Dto;
using Shesha;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Notifications;
using Shesha.Notifications.Dto;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services
{
    public class NotificationTestAppService: SheshaAppServiceBase
    {
        private readonly INotificationSender _notificationService;
        private readonly IRepository<NotificationChannelConfig, Guid> _notificationChannelRepository;
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<NotificationTypeConfig, Guid> _notificationTypeRepository;
        private readonly IStoredFileService _storedFileService;
        
        public NotificationTestAppService(INotificationSender notificationService, IRepository<NotificationChannelConfig, Guid> notificationChannelRepository, IRepository<Person, Guid> personRepository, IRepository<NotificationTypeConfig, Guid> notificationTypeRepository, IStoredFileService storedFileService)
        {
            _notificationService = notificationService;
            _notificationChannelRepository = notificationChannelRepository;
            _personRepository = personRepository;
            _notificationTypeRepository = notificationTypeRepository;
            _storedFileService = storedFileService;
        }

        public async Task TestNotificationAsync(NotificationDto notification)
        {
            // Fetch notification type details
            var type = await _notificationTypeRepository.FirstOrDefaultAsync(notification.Type.Id);
            if (type == null)
                throw new ArgumentException($"Notification type with ID {notification.Type.Id} does not exist.");
            // Get recipient details
            var recipient = await _personRepository.FirstOrDefaultAsync(notification.Recipient.Id);
            if (recipient == null)
                throw new ArgumentException($"Recipient with ID {notification.Recipient.Id} does not exist.");
            // Get channel details
            var channel = notification.Channel != null ? await _notificationChannelRepository.FirstOrDefaultAsync(notification.Channel.Id) : null;
            // Prepare notification data
            var data = new TestNotificationData()
            {
                Name = recipient.FullName,
                Subject = type.Name,
                Body = type.Description
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
                (RefListNotificationPriority)notification.Priority,
                attachments,
                null,
                channel
            );
        }
        public async Task BulkPublishAsync(BulkNotificationDto notification)
        {
            if (notification.Recipients == null || notification.Recipients.Count == 0)
                throw new ArgumentException("Recipients must not be null or empty.");
            // Fetch notification type details
            var type = await _notificationTypeRepository.FirstOrDefaultAsync(notification.Type.Id);
            if (type == null)
                throw new ArgumentException($"Notification type with ID {notification.Type.Id} does not exist.");
            // Get channel details
            var channel = notification.Channel != null ? await _notificationChannelRepository.FirstOrDefaultAsync(notification.Channel.Id) : null;
            // Prepare notification data
            var data = new TestNotificationData()
            {
                Name = "Test Name",
            };
            // Get the current person
            var sender = await GetCurrentPersonAsync();
            if (sender == null)
                throw new InvalidOperationException("Current person could not be determined. Ensure the user is logged in.");
            // Send notification to each recipient
            foreach (var reciever in notification.Recipients)
            {
                var recipient = await _personRepository.FirstOrDefaultAsync(reciever.Id);
                if (recipient == null)
                    throw new Exception($"{nameof(recipient)} must not be null");

                await _notificationService.SendNotification(
                    type,
                    sender,
                    recipient,
                    data,
                    (RefListNotificationPriority)notification.Priority,
                    null,
                    null,
                    channel
                 );
            }
        }

    }
}
