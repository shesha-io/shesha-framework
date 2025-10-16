using Abp.Domain.Repositories;
using Boxfusion.SheshaFunctionalTests.Common.Application.Services.Dto;
using Shesha;
using Shesha.DelayedUpdate;
using Shesha.Domain;
using Shesha.Notifications;
using Shesha.Notifications.Dto;
using Shesha.Notifications.MessageParticipants;
using Shesha.Services;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services
{
    public class NotificationTestAppService: SheshaAppServiceBase
    {
        private readonly INotificationSender _notificationService;
        private readonly IRepository<NotificationChannelConfig, Guid> _notificationChannelRepository;
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<NotificationTypeConfig, Guid> _notificationTypeRepository;
        private readonly IRepository<StoredFile, Guid> _storedFileRepository;
        
        public NotificationTestAppService(
            INotificationSender notificationService,
            IRepository<NotificationChannelConfig, Guid> notificationChannelRepository,
            IRepository<Person, Guid> personRepository,
            IRepository<NotificationTypeConfig, Guid> notificationTypeRepository,
            IRepository<StoredFile, Guid> storedFileRepository
        )
        {
            _notificationService = notificationService;
            _notificationChannelRepository = notificationChannelRepository;
            _personRepository = personRepository;
            _notificationTypeRepository = notificationTypeRepository;
            _storedFileRepository = storedFileRepository;
        }

        private async Task<List<NotificationAttachmentDto>> GetAttachmentsAsync(DelayedUpdateGroup[]? delayedUpdate)
        {
            List<NotificationAttachmentDto> attachments = new List<NotificationAttachmentDto>();

            var payloadFiles = delayedUpdate?.FirstOrDefault(x => x.Name == "storedFiles");

            if (payloadFiles != null && payloadFiles.Items.Count > 0)
            {
                foreach (var payloadFile in payloadFiles.Items)
                {
                    var file = await _storedFileRepository.GetAsync(Guid.Parse(payloadFile.Id.ToString()));
                    if (file != null)
                    {
                        attachments.Add(new NotificationAttachmentDto()
                        {
                            FileName = file.FileName,
                            StoredFileId = file.Id,
                        });
                    }
                }
            }

            return attachments;
        }

        public async Task TestNotificationAsync(NotificationDto notification)
        {
            var attachments = await GetAttachmentsAsync(notification._delayedUpdate);

            if (notification.Type == null)
                throw new ArgumentException($"{nameof(notification.Type)} must not be  null");

            // Fetch notification type details
            var type = await _notificationTypeRepository.FirstOrDefaultAsync(notification.Type.Id);
            if (type == null)
                throw new ArgumentException($"Notification type with ID {notification.Type.Id} does not exist.");
            // Get recipient details
            var recipientPerson = notification.Recipient?.Id != null 
                ? await _personRepository.FirstOrDefaultAsync(notification.Recipient.Id)
                : null;
            // Get channel details
            var channel = notification.Channel != null ? await _notificationChannelRepository.FirstOrDefaultAsync(notification.Channel.Id) : null;
            // Prepare notification data
            var data = new TestNotificationData()
            {
                Name = recipientPerson?.FullName ?? "Unknown Recipient",
                Subject = type.Name,
                Body = type.Description
            };

            var senderPerson = await GetCurrentPersonAsync();
            if (senderPerson == null)
                throw new InvalidOperationException("Current person could not be determined. Ensure the user is logged in.");

            var sender = new PersonMessageParticipant(senderPerson);
            IMessageReceiver recipient = recipientPerson != null
                ? new PersonMessageParticipant(recipientPerson)
                : !string.IsNullOrWhiteSpace(notification.RecipientText)
                    ? new RawAddressMessageParticipant(notification.RecipientText)
                    : throw new ArgumentException($"{nameof(notification.RecipientText)} must not be null");

            await _notificationService.SendNotificationAsync(
                type,
                sender,
                recipient,                
                data,
                notification.Priority,
                attachments,
                notification.Cc,
                null,
                channel
            );
         }
        public async Task BulkPublishAsync(BulkNotificationDto notification)
        {
            if (notification.Type == null)
                throw new ArgumentException($"{nameof(notification.Type)} must not be  null");

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
            var senderPerson = await GetCurrentPersonAsync();
            if (senderPerson == null)
                throw new InvalidOperationException("Current person could not be determined. Ensure the user is logged in.");

            var attachments = await GetAttachmentsAsync(notification._delayedUpdate);

            var sender = new PersonMessageParticipant(senderPerson);

            if (notification.RecipientTexts != null)
            {
                foreach (var recipient in notification.RecipientTexts)
                {
                    var receiver = new RawAddressMessageParticipant(recipient);
                    await _notificationService.SendNotificationAsync(
                        type,
                        sender,
                        receiver,
                        data,
                        notification.Priority,
                        attachments,
                        null,
                        null,
                        channel
                     );
                }
            }
           
            if (notification.Recipients != null)
            {

                foreach (var recipient in notification.Recipients)
                {
                    var receiver = await _personRepository.GetAsync(recipient.Id);

                    await _notificationService.SendNotificationAsync(
                        type,
                        senderPerson,
                        receiver,
                        data,
                        notification.Priority,
                        attachments,
                        null,
                        null,
                        channel
                     );
                }            
            }           
        }        
    }
}
