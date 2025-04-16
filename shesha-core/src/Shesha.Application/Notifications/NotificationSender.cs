using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Notifications;
using Abp.UI;
using Castle.Core.Logging;
using Hangfire;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Email.Dtos;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.NHibernate;
using Shesha.Notifications.Dto;
using Shesha.Notifications.Exceptions;
using Shesha.Notifications.MessageParticipants;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Shesha.Notifications
{
    public class NotificationSender: INotificationSender, ITransientDependency
    {
        private readonly INotificationChannelSender _channelSender;
        private readonly IRepository<NotificationMessage, Guid> _notificationMessageRepository;
        private readonly IRepository<NotificationMessageAttachment, Guid> _attachmentRepository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IStoredFileService _fileService;
        private readonly IEnumerable<INotificationChannelSender> _channelSenders;
        private readonly IRepository<Notification, Guid> _notificationRepository;
        private readonly IRepository<NotificationTemplate, Guid> _messageTemplateRepository;
        private readonly IRepository<StoredFile, Guid> _storedFileRepository;
        private readonly INotificationManager _notificationManager;
        private readonly INotificationTemplateProcessor _templateProcessor;

        public ILogger Logger { get; set; }

        public NotificationSender(INotificationChannelSender channelSender,
            IRepository<NotificationMessage, Guid> notificationMessageRepository,
            IRepository<NotificationMessageAttachment, Guid> attachmentRepository,
            IUnitOfWorkManager unitOfWorkManager,
            IStoredFileService fileService,
            IEnumerable<INotificationChannelSender> channelSenders,
            IRepository<NotificationTemplate, Guid> messageTemplateRepository,
            IRepository<Notification, Guid> notificationRepository,
            IRepository<StoredFile, Guid> storedFileRepository,
            INotificationManager notificationManager,
            INotificationTemplateProcessor templateProcessor)
        {
            _channelSender = channelSender;
            _notificationMessageRepository = notificationMessageRepository;
            _attachmentRepository = attachmentRepository;
            _unitOfWorkManager = unitOfWorkManager;
            _fileService = fileService;
            _channelSenders = channelSenders;
            _messageTemplateRepository = messageTemplateRepository;
            _notificationRepository = notificationRepository;
            _storedFileRepository = storedFileRepository;
            _notificationManager = notificationManager;
            _templateProcessor = templateProcessor;
            
            Logger = NullLogger.Instance;
        }

        private async Task<List<EmailAttachment>> GetAttachmentsAsync(NotificationMessage message)
        {
            var attachments = await _attachmentRepository.GetAll().Where(a => a.Message.Id == message.Id).ToListAsync();

            var result = new List<EmailAttachment>();
            foreach (var attachment in attachments) 
            {
                if (!await _fileService.FileExistsAsync(attachment.File.Id)) {
                    Logger.Warn($"Attachment '{attachment.File.FileName}' (Id = '{attachment.File.Id}') is missing - skipped");
                    continue;
                }

                var fileStream = await _fileService.GetStreamAsync(attachment.File);
                result.Add(new EmailAttachment(attachment.FileName, fileStream));
            }
            return result;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="TData"></typeparam>
        /// <param name="type"></param>
        /// <param name="sender"></param>
        /// <param name="receiver"></param>
        /// <param name="data"></param>
        /// <param name="priority"></param>
        /// <param name="attachments"></param>
        /// <param name="cc"></param>
        /// <param name="triggeringEntity"></param>
        /// <param name="channel"></param>
        /// <param name="category"></param>
        /// <returns></returns>
        public async Task SendNotificationAsync<TData>(
            NotificationTypeConfig type, 
            IMessageSender? sender, 
            IMessageReceiver receiver, 
            TData data, 
            RefListNotificationPriority priority, 
            List<NotificationAttachmentDto>? attachments = null,
            string? cc = null,
            GenericEntityReference? triggeringEntity = null, 
            NotificationChannelConfig? channel = null,
            string? category = null) where TData : NotificationData
        {
            // Check if the notification type is disabled
            if (type.Disable) 
                return;

            if (type.CanOptOut)
            {
                var optedOut = await receiver.IsNotificationOptedOutAsync(type);
                if (optedOut)
                    return;
            }

            var notification = await _notificationRepository.InsertAsync(new Notification()
            {
                Name = type.Name,
                NotificationType = type,
                FromPerson = sender?.GetPerson(),
                ToPerson = receiver.GetPerson(),
                NotificationData = JsonSerializer.Serialize(data),
                TriggeringEntity = triggeringEntity,
                Priority = priority,
                Category = category ?? string.Empty,
            });

            await _unitOfWorkManager.Current.SaveChangesAsync();

            if (channel != null)
            {
                // Send notification to a specific channel
                await SendNotificationToChannelAsync(notification, data, sender, receiver, type, priority, channel, cc, attachments);
            }
            else
            {
                // Send notification to all determined channels
                var channels = await _notificationManager.GetChannelsAsync(type, receiver, (RefListNotificationPriority)priority);

                foreach (var channelConfig in channels)
                {
                    await SendNotificationToChannelAsync(notification, data, sender, receiver, type, priority, channelConfig, cc, attachments);
                }
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="TData"></typeparam>
        /// <param name="notification"></param>
        /// <param name="data"></param>
        /// <param name="sender"></param>
        /// <param name="receiver"></param>
        /// <param name="cc"></param>
        /// <param name="type"></param>
        /// <param name="priority"></param>
        /// <param name="channelConfig"></param>
        /// <param name="attachments"></param>
        /// <returns></returns>
        /// <exception cref="UserFriendlyException"></exception>
        private async Task SendNotificationToChannelAsync<TData>(
            Notification notification, 
            TData data, 
            IMessageSender? sender, 
            IMessageReceiver receiver,
            NotificationTypeConfig type,
            RefListNotificationPriority priority, 
            NotificationChannelConfig channelConfig,
            string? cc = null,
            List<NotificationAttachmentDto>? attachments = null) where TData : NotificationData
        {
            var template = await _messageTemplateRepository.FirstOrDefaultAsync(x => x.PartOf.Id == type.Id && channelConfig.SupportedFormat == x.MessageFormat);

            if (template == null)
                throw new UserFriendlyException($"There is no {type.Name} template found for the {channelConfig.Name} channel");

            // Create a new notification message
            var message = await _notificationMessageRepository.InsertAsync(new NotificationMessage()
            {
                PartOf = notification,
                Channel = channelConfig,
                Subject = await GenerateContentAsync(template.TitleTemplate, data) ?? string.Empty,
                Message = await GenerateContentAsync(template.BodyTemplate, data) ?? string.Empty,
                RetryCount = 0,
                ReadStatus = RefListNotificationReadStatus.Unread,
                Direction = RefListNotificationDirection.Outgoing,
                Status = RefListNotificationStatus.Preparing,
                RecipientText = receiver.GetAddress(_channelSender),
                Cc = cc,
            });

            await _unitOfWorkManager.Current.SaveChangesAsync();

            // Save attachments if specified and allowed
            if (attachments != null && attachments.Any() && channelConfig.SupportsAttachment && type.AllowAttachments)
            {
                foreach (var attachmentDto in attachments)
                {
                    var file = await _storedFileRepository.GetAsync(attachmentDto.StoredFileId);

                    await _attachmentRepository.InsertAsync(new NotificationMessageAttachment()
                    {
                        Message = message,
                        File = file,
                        FileName = attachmentDto.FileName
                    });
                }
            }

            if (type.IsTimeSensitive)
            {
                await SendAsync(message.Id);
            }
            else
            {
                _unitOfWorkManager.Current.DoAfterTransaction(() => BackgroundJob.Enqueue(() => SendAsync(message.Id)));
            }
        }

        /// <summary>
        /// Generate content based on template (uses mustache syntax)
        /// </summary>
        protected async Task<string?> GenerateContentAsync<TData>(string? template, TData data) where TData: class
        {
            return !string.IsNullOrWhiteSpace(template)
                ? await _templateProcessor.GenerateAsync(template, data)
                : template;
        }

        private INotificationChannelSender GetChannelSender(NotificationMessage message) 
        {
            var sender = _channelSenders.FirstOrDefault(x => x.GetType().Name == message.Channel.SenderTypeName);

            if (sender == null)
                throw new UserFriendlyException($"Sender not found for channel {message.Channel.Name}");

            return sender;
        }

        private IMessageSender? GetMessageSenderOrNull(NotificationMessage message)
        {
            if (message.PartOf.FromPerson != null)
                return new PersonMessageParticipant(message.PartOf.FromPerson);

            if (!string.IsNullOrWhiteSpace(message.SenderText))
                return new RawAddressMessageParticipant(message.SenderText);

            return null;
        }

        private IMessageSender GetMessageSender(NotificationMessage message) => GetMessageSenderOrNull(message) ?? throw new Exception($"{nameof(message.PartOf.FromPerson)} or {nameof(message.SenderText)} must not be null");

        private IMessageReceiver GetMessageReceiver(NotificationMessage message)
        {
            if (message.PartOf.ToPerson != null)
                return new PersonMessageParticipant(message.PartOf.ToPerson);

            if (!string.IsNullOrWhiteSpace(message.RecipientText))
                return new RawAddressMessageParticipant(message.RecipientText);

            throw new Exception($"{nameof(message.PartOf.ToPerson)} or {nameof(message.RecipientText)} must not be null");
        }

        [AutomaticRetry(Attempts = 3, DelaysInSeconds = new int[] { 10, 20, 20 })]
        public async Task SendAsync(Guid messageId)
        {
            using (var uow = _unitOfWorkManager.Begin())
            {
                var message = await _notificationMessageRepository.GetAsync(messageId);
                var channelSender = GetChannelSender(message);

                var attachments = await GetAttachmentsAsync(message);

                var sender = GetMessageSenderOrNull(message);
                var reciever = GetMessageReceiver(message);

                message.RecipientText = reciever.GetAddress(channelSender);

                // Use TrySendAsync to handle the send attempt
                var sendResult = await TrySendAsync(sender, reciever, message, channelSender, attachments);

                if (sendResult.IsSuccess)
                {
                    message.Status = RefListNotificationStatus.Sent;
                    message.ErrorMessage = null; // Clear any previous error
                    message.DateSent = DateTime.Now;
                    await _notificationMessageRepository.UpdateAsync(message);
                    await _unitOfWorkManager.Current.SaveChangesAsync();

                    await uow.CompleteAsync();
                }
                else
                {
                    message.RetryCount++;
                    message.Status = message.RetryCount < 3 ? RefListNotificationStatus.WaitToRetry : RefListNotificationStatus.Failed;
                    message.ErrorMessage = sendResult.Message;

                    await _notificationMessageRepository.UpdateAsync(message);
                    await _unitOfWorkManager.Current.SaveChangesAsync();

                    await uow.CompleteAsync();

                    if (message.Status == RefListNotificationStatus.WaitToRetry)
                        throw new ShaMessageFailedWaitRetryException(message.Id);
                };
            }
        }

        [Obsolete("For backward compatibility only (is used by old scheduled jobs)")]
        public async Task SendAsync(Guid fromPersonId, Guid toPersonId, Guid messageId, string channelName, string senderTypeName) 
        {
            await SendAsync(messageId);
        }

        /// <summary>
        /// Attempts to send a notification and handles exceptions internally.
        /// </summary>
        private async Task<SendStatus> TrySendAsync(
            IMessageSender? sender,
            IMessageReceiver receiver,
            NotificationMessage message,
            INotificationChannelSender notificationChannelSender,
            List<EmailAttachment> attachments)
        {
            try
            {
                var sendStatus = await notificationChannelSender.SendAsync(sender, receiver, message, attachments);

                return new SendStatus
                {
                    IsSuccess = sendStatus.IsSuccess,
                    Message = sendStatus.IsSuccess ? null : $"Failed to send notification: {sendStatus.Message}"
                };
            }
            catch (Exception ex)
            {
                Logger.Error($"Exception while sending notification {message.Id}: {ex.Message}");

                return new SendStatus
                {
                    IsSuccess = false,
                    Message = $"Exception while sending notification: {ex.Message}"
                };
            }
        }

        public async Task SendNotificationAsync<TData>(
            NotificationTypeConfig type, 
            Person? senderPerson, 
            Person receiverPerson, 
            TData data, 
            RefListNotificationPriority priority, 
            List<NotificationAttachmentDto>? attachments = null,
            string? cc = null,
            GenericEntityReference? triggeringEntity = null, 
            NotificationChannelConfig? channel = null,
            string? category = null) where TData : NotificationData
        {
            var sender = senderPerson != null 
                ? new PersonMessageParticipant(senderPerson)
                : null;
            var receiver = new PersonMessageParticipant(receiverPerson);            
            await SendNotificationAsync(type, sender, receiver, data, priority, attachments, cc, triggeringEntity, channel, category);
        }
    }
}