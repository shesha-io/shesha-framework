using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
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

        public readonly int MaxRetries = 3;

        public NotificationSender(INotificationChannelSender channelSender)
        {
            _channelSender = channelSender;
        }

        private async Task<List<EmailAttachment>> GetAttachmentsAsync(NotificationMessage message)
        {
            var _attachmentRepository = StaticContext.IocManager.Resolve<IRepository<NotificationMessageAttachment, Guid>>();
            var _fileService = StaticContext.IocManager.Resolve<IStoredFileService>();

            var attachments = await _attachmentRepository.GetAll().Where(a => a.Message.Id == message.Id).ToListAsync();

            var result = attachments.Select(a => new EmailAttachment(a.FileName, _fileService.GetStream(a.File))).ToList();

            return result;
        }

        [UnitOfWork]
        public async Task SendAsync(Person fromPerson, Person toPerson, NotificationMessage message, bool isBodyHtml)
        {
            var _notificationMessageRepository = StaticContext.IocManager.Resolve<IRepository<NotificationMessage, Guid>>();
            var _unitOfWorkManager = StaticContext.IocManager.Resolve<IUnitOfWorkManager>();
            var _sessionProvider = StaticContext.IocManager.Resolve<ISessionProvider>();
            var attachments = await GetAttachmentsAsync(message);
            int attempt = 0;
            bool sentSuccessfully = false;

            while (attempt < MaxRetries && !sentSuccessfully)
            {
                try
                {
                    // Attempt to send the message
                    sentSuccessfully =await _channelSender.SendAsync(fromPerson, toPerson, message, isBodyHtml, "", true, attachments);

                    if (sentSuccessfully)
                    {
                        // Successful send, exit the loop
                        message.Status = RefListNotificationStatus.Sent;

                        break;
                    }
                    else
                    {
                        Console.WriteLine($"Attempt {attempt + 1} to send notification failed.");
                    }
                }
                catch (Exception ex)
                {
                    message.ErrorMessage = $"Exception on attempt {attempt + 1} to send notification: {ex.Message}";
                    Console.WriteLine($"Exception on attempt {attempt + 1} to send notification: {ex.Message}");
                }

                // Increment retry count and save to the database
                attempt++;
                message.RetryCount = attempt;
                message.ErrorMessage = $"Failed to send notification after {attempt} attempts.";
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

            if (!sentSuccessfully)
            {
                Console.WriteLine($"Failed to send notification after {MaxRetries} attempts.");
                //throw new Exception("Failed to send notification after maximum retry attempts.");
            }
        }


        [UnitOfWork]
        public async Task SendBroadcastAsync(Notification notification, string subject, string messageContent, List<EmailAttachment> attachments)
        {
            int attempt = 0;
            Tuple<bool, string> sentSuccessfully = new Tuple<bool, string>(false, "");
            var _notificationMessageRepository = StaticContext.IocManager.Resolve<IRepository<NotificationMessage, Guid>>();

            // Get all notification messages associated with the notification
            var messages = _notificationMessageRepository.GetAll().Where(m => m.PartOf.Id == notification.Id).ToList();

            while (attempt < MaxRetries && !sentSuccessfully.Item1)
            {
                try
                {
                    // Attempt to send the message via the channel sender
                    sentSuccessfully = await _channelSender.BroadcastAsync(notification.NotificationTopic, subject, messageContent, attachments);

                    foreach (var message in messages)
                    {
                        if (sentSuccessfully.Item1)
                        {
                            // Update the status to Sent for successful messages
                            message.Status = RefListNotificationStatus.Sent;
                            message.RetryCount = attempt;
                            message.ErrorMessage = null; // Clear error message
                        }
                        else
                        {
                            Console.WriteLine($"Attempt {attempt + 1} to send notification failed.");
                            message.Status = RefListNotificationStatus.Failed;
                            message.RetryCount = attempt;
                            message.ErrorMessage = $"Failed to send notification on attempt {attempt + 1}. Message: {sentSuccessfully.Item2}";
                        }

                        // Save changes to each message
                        using (var uow = StaticContext.IocManager.Resolve<IUnitOfWorkManager>().Begin())
                        {
                            using (var transaction = StaticContext.IocManager.Resolve<ISessionProvider>().Session.BeginTransaction())
                            {
                                await _notificationMessageRepository.UpdateAsync(message);
                                transaction.Commit();
                            }
                            await uow.CompleteAsync();
                        }
                    }

                    if (sentSuccessfully.Item1)
                    {
                        // If any message was successfully sent, exit the loop
                        break;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Exception on attempt {attempt + 1} to send broadcast notification: {ex.Message}");
                }

                // Introduce a delay before retrying
                attempt++;
                if (attempt < MaxRetries)
                {
                    await Task.Delay(1000); // Backoff delay
                }
            }

            if (!sentSuccessfully.Item1)
            {
                Console.WriteLine($"Failed to send notification after {MaxRetries} attempts.");
            }
        }
    }
}
