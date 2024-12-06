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
using Shesha.Notifications.Dto;
using Shesha.Notifications.Jobs;
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
        public async Task SendAsync(Person fromPerson, Person toPerson, NotificationMessage message, INotificationChannelSender notificationChannelSender)
        {
            var attachments = await GetAttachmentsAsync(message);

            try
            {
                var sendStatus = await notificationChannelSender.SendAsync(fromPerson, toPerson, message, "", attachments);

                // Update the message status based on send result
                if (sendStatus.IsSuccess)
                {
                    message.Status = RefListNotificationStatus.Sent;
                    message.RetryCount = 0; // No retry as this is the first (successful) attempt
                    message.ErrorMessage = null; // Clear any previous error

                    await _notificationMessageRepository.UpdateAsync(message);
                }
                else
                {
                    // Increment the retry count for the message
                    message.RetryCount++;

                    await _notificationMessageRepository.UpdateAsync(message);

                    _unitOfWorkManager.Current.SaveChanges();

                    // Schedule the next attempt through the background job
                    ScheduleDirectRetryJob(message, notificationChannelSender);
                }

                // Update message status in the database
                await _notificationMessageRepository.UpdateAsync(message);

                _unitOfWorkManager.Current.SaveChanges();
            }
            catch (Exception ex)
            {
                message.Status = RefListNotificationStatus.Failed;
                message.ErrorMessage = $"Exception while sending notification: {ex.Message}";

                await _notificationMessageRepository.UpdateAsync(message);

                Logger.Error($"Exception while sending notification {message.Id}: {ex.Message}");

                // Schedule a retry job if an exception occurs
                ScheduleDirectRetryJob(message, notificationChannelSender);
            }
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="message"></param>
        /// <param name="notificationChannelSender"></param>
        /// <returns></returns>
        private void ScheduleDirectRetryJob(NotificationMessage message, INotificationChannelSender notificationChannelSender)
        {
            var jobArgs = new DirectNotificationJobArgs
            {
                FromPerson = message.PartOf.FromPerson.Id,
                ToPerson = message.PartOf.ToPerson.Id,     
                Message = message.Id,
                SenderTypeName = notificationChannelSender.GetType().Name,
                Attempt = message.RetryCount
            };

            // Schedule the next retry job with a delay
            BackgroundJob.Enqueue<DirectNotificationJobQueuer>(x => x.ExecuteAsync(jobArgs));
        }

        [UnitOfWork]
        public async Task SendBroadcastAsync(Notification notification, string subject, string messageContent, List<EmailAttachment> attachments, INotificationChannelSender notificationChannelSender)
        {
            int attempt = 0;
            SendStatus sendStatus = new SendStatus();

            // Get all notification messages associated with the notification
            var messages = _notificationMessageRepository.GetAll().Where(m => m.PartOf.Id == notification.Id).ToList();

            while (attempt < MaxRetries && !sendStatus.IsSuccess)
            {
                try
                {
                    // Attempt to send the message via the channel sender
                    sendStatus = await notificationChannelSender.BroadcastAsync(notification.NotificationTopic, subject, messageContent, attachments);

                    foreach (var message in messages)
                    {
                        if (sendStatus.IsSuccess)
                        {
                            // Update the status to Sent for successful messages
                            message.Status = RefListNotificationStatus.Sent;
                            message.RetryCount = attempt;
                            message.ErrorMessage = null; // Clear error message
                        }
                        else
                        {
                            Logger.ErrorFormat($"Attempt {attempt + 1} to send notification failed. Message: {sendStatus.Message}");
                            message.Status = RefListNotificationStatus.Failed;
                            message.RetryCount = attempt;
                            message.ErrorMessage = $"Failed to send notification on attempt {attempt + 1}. Message: {sendStatus.Message}";
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

                    if (sendStatus.IsSuccess)
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

            if (!sendStatus.IsSuccess)
            {
                Logger.ErrorFormat($"Failed to send notification after {MaxRetries} attempts. Message: {sendStatus.Message}");
            }
        }
    }
}
