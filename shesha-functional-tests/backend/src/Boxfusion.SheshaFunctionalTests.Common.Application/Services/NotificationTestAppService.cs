using Abp.Collections.Extensions;
using Abp.Domain.Repositories;
using Boxfusion.SheshaFunctionalTests.Common.Application.Services.Dto;
using NSubstitute;
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
            var recipient = notification.Recipient?.Id != null ? await _personRepository.FirstOrDefaultAsync(notification.Recipient.Id): null;
            // Get channel details
            var channel = notification.Channel != null ? await _notificationChannelRepository.FirstOrDefaultAsync(notification.Channel.Id) : null;
            // Prepare notification data
            var data = new TestNotificationData()
            {
                Name = recipient?.FullName ?? "Unknown Recipient",
                Subject = type.Name,
                Body = type.Description
            };

            // Get attachments only if recipient is provided
            List<NotificationAttachmentDto> attachments = new();
            if (recipient != null)
            {
                var getAttachments = await _storedFileService.GetAttachmentsAsync(recipient.Id, "Shesha.Domain.Person");
                attachments = getAttachments.Select(x => new NotificationAttachmentDto()
                {
                    FileName = x.FileName,
                    StoredFileId = x.Id,
                }).ToList();
            }

            var sender = await GetCurrentPersonAsync();
            if (sender == null)
                throw new InvalidOperationException("Current person could not be determined. Ensure the user is logged in.");

            await _notificationService.SendNotification(
                type,
                sender,
                recipient,
                notification.RecipientText,
                data,
                (RefListNotificationPriority)notification.Priority,
                attachments,
                null,
                channel
            );
        }
        public async Task BulkPublishAsync(BulkNotificationDto notification)
        {
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

            if (!notification.RecipientTexts.IsNullOrEmpty())
            {
                foreach (var recipient in notification.RecipientTexts)
                {
                    await _notificationService.SendNotification(
                        type,
                        sender,
                        null,
                        recipient,
                        data,
                        (RefListNotificationPriority)notification.Priority,
                        null,
                        null,
                        channel
                     );
                }
            }
           
            if (!notification.Recipients.IsNullOrEmpty())
            {

                foreach (var recipient in notification.Recipients)
                {
                    var reciever = await _personRepository.FirstOrDefaultAsync(recipient.Id);
                    if (recipient == null)
                        throw new Exception($"{nameof(recipient)} must not be null");

                    await _notificationService.SendNotification(
                        type,
                        sender,
                        reciever,
                        null,
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
}
