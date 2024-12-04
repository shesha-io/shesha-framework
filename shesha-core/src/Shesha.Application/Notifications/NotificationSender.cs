using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Castle.Core.Logging;
using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Wordprocessing;
using Hangfire;
using NHibernate.Linq;
using Shesha.Configuration;
using Shesha.Configuration.Email;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Email.Dtos;
using Shesha.NHibernate;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Notifications
{
    public class NotificationSender: INotificationSender
    {
        private readonly INotificationChannelSender _channelSender;
        private readonly IIocManager _iocManager;
        private readonly IRepository<NotificationMessage, Guid> _notificationMessageRepository;
        private readonly IRepository<NotificationMessageAttachment, Guid> _attachmentRepository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly ISessionProvider _sessionProvider;
        private readonly IStoredFileService _fileService;

        public readonly int MaxRetries = 3;
        public ILogger Logger { get; set; }

        public NotificationSender(INotificationChannelSender channelSender, 
            IIocManager iocManager,
            IRepository<NotificationMessage, Guid> notificationMessageRepository,
            IRepository<NotificationMessageAttachment, Guid> attachmentRepository,
            IUnitOfWorkManager unitOfWorkManager,
            ISessionProvider sessionProvider,
            IStoredFileService fileService)
        {
            _channelSender = channelSender;
            _iocManager = iocManager;
            _notificationMessageRepository = notificationMessageRepository;
            _attachmentRepository = attachmentRepository;
            _unitOfWorkManager = unitOfWorkManager;
            _sessionProvider = sessionProvider;
            _fileService = fileService;
            Logger = NullLogger.Instance;
        }

        private async Task<List<EmailAttachment>> GetAttachmentsAsync(NotificationMessage message)
        {
            var attachments = await _attachmentRepository.GetAll().Where(a => a.Message.Id == message.Id).ToListAsync();

            var result = attachments.Select(a => new EmailAttachment(a.FileName, _fileService.GetStream(a.File))).ToList();

            return result;
        }

        [UnitOfWork]
        public async Task SendAsync(Person fromPerson, Person toPerson, NotificationMessage message, bool isBodyHtml)
        {
            var attachments = await GetAttachmentsAsync(message);
            int attempt = 0;
            Tuple<bool, string> sendStatus = new Tuple<bool, string>(false, "");

            while (attempt < MaxRetries && !sendStatus.Item1)
            {
                try
                {
                    // Attempt to send the message
                    sendStatus = await _channelSender.SendAsync(fromPerson, toPerson, message, isBodyHtml, "", attachments);

                    if (sendStatus.Item1)
                    {
                        // Successful send, exit the loop
                        message.Status = RefListNotificationStatus.Sent;
                        message.RetryCount = attempt;
                        message.ErrorMessage = null; // Clear error message

                        break;
                    }
                    else
                    {
                        Logger.ErrorFormat($"Attempt {attempt + 1} to send notification failed. Message: {sendStatus.Item2}");
                    }
                }
                catch (Exception ex)
                {
                    message.ErrorMessage = $"Exception on attempt {attempt + 1} to send notification: {ex.Message}";
                    Logger.ErrorFormat($"Exception on attempt {attempt + 1} to send notification: {ex.Message}");
                }

                // Increment retry count and save to the database
                attempt++;
                message.RetryCount = attempt;
                message.ErrorMessage = $"Failed to send notification after {attempt} attempts. Message: {sendStatus.Item2}";
                message.Status = RefListNotificationStatus.Failed;

                using (var uow = _unitOfWorkManager.Begin())
                {

                    using (var transaction = _sessionProvider.Session.BeginTransaction())
                    {
                        await _notificationMessageRepository.UpdateAsync(message);
                        transaction.Commit();
                    }
                    await uow.CompleteAsync();
                }

                // Introduce a delay before the next retry attempt
                if (attempt < MaxRetries)
                {
                    await Task.Delay(1000); // Backoff delay
                }
            }

            if (!sendStatus.Item1)
            {
                Logger.ErrorFormat($"Failed to send notification after {MaxRetries} attempts. Message: {sendStatus.Item2}");
                //throw new Exception("Failed to send notification after maximum retry attempts.");
            }
        }


        [UnitOfWork]
        public async Task SendBroadcastAsync(Notification notification, string subject, string messageContent, List<EmailAttachment> attachments)
        {
            int attempt = 0;
            Tuple<bool, string> sendStatus = new Tuple<bool, string>(false, "");

            // Get all notification messages associated with the notification
            var messages = _notificationMessageRepository.GetAll().Where(m => m.PartOf.Id == notification.Id).ToList();

            while (attempt < MaxRetries && !sendStatus.Item1)
            {
                try
                {
                    // Attempt to send the message via the channel sender
                    sendStatus = await _channelSender.BroadcastAsync(notification.NotificationTopic, subject, messageContent, attachments);

                    foreach (var message in messages)
                    {
                        if (sendStatus.Item1)
                        {
                            // Update the status to Sent for successful messages
                            message.Status = RefListNotificationStatus.Sent;
                            message.RetryCount = attempt;
                            message.ErrorMessage = null; // Clear error message
                        }
                        else
                        {
                            Logger.ErrorFormat($"Attempt {attempt + 1} to send notification failed. Message: {sendStatus.Item2}");
                            message.Status = RefListNotificationStatus.Failed;
                            message.RetryCount = attempt;
                            message.ErrorMessage = $"Failed to send notification on attempt {attempt + 1}. Message: {sendStatus.Item2}";
                        }

                        // Save changes to each message
                        using (var uow = _unitOfWorkManager.Begin())
                        {
                            using (var transaction = _sessionProvider.Session.BeginTransaction())
                            {
                                await _notificationMessageRepository.UpdateAsync(message);
                                transaction.Commit();
                            }
                            await uow.CompleteAsync();
                        }
                    }

                    if (sendStatus.Item1)
                    {
                        // If any message was successfully sent, exit the loop
                        break;
                    }
                }
                catch (Exception ex)
                {
                    Logger.ErrorFormat($"Exception on attempt {attempt + 1} to send broadcast notification: {ex.Message}");
                }

                // Introduce a delay before retrying
                attempt++;
                if (attempt < MaxRetries)
                {
                    await Task.Delay(1000); // Backoff delay
                }
            }

            if (!sendStatus.Item1)
            {
                Logger.ErrorFormat($"Failed to send notification after {MaxRetries} attempts. Message: {sendStatus.Item2}");
            }
        }
    }
}
