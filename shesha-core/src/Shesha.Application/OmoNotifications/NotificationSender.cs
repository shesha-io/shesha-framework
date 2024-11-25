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
using Shesha.Notifications.Dto;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.OmoNotifications
{
    public class NotificationSender: INotificationSender
    {
        private readonly INotificationChannelSender _channelSender;

        public readonly int MaxRetries = 3;

        public NotificationSender(INotificationChannelSender channelSender)
        {
            _channelSender = channelSender;
        }

        private async Task<List<EmailAttachment>> GetAttachmentsAsync(OmoNotificationMessage message)
        {
            var _attachmentRepository = StaticContext.IocManager.Resolve<IRepository<OmoNotificationMessageAttachment, Guid>>();
            var _fileService = StaticContext.IocManager.Resolve<IStoredFileService>();

            var attachments = await _attachmentRepository.GetAll().Where(a => a.PartOf.Id == message.Id).ToListAsync();

            var result = attachments.Select(a => new EmailAttachment(a.FileName, _fileService.GetStream(a.File))).ToList();

            return result;
        }

        [UnitOfWork]
        public async Task SendBroadcastAsync(OmoNotification notification, string subject, string message, List<EmailAttachment> attachments)
        {
            //int attempt = 0;
            //bool sentSuccessfully = false;
            //var _notificationMessageRepository = StaticContext.IocManager.Resolve<IRepository<OmoNotificationMessage, Guid>>();

            await _channelSender.BroadcastAsync(notification.NotificationTopic, subject, message, attachments);

            //var messages = _notificationMessageRepository.GetAll().Where(m => m.PartOf.Id == notification.Id).ToList();

            //foreach (var message in messages)
            //{
            //    var fromPerson = message.FromPerson;
            //    var toPerson = message.ToPerson;

            //    while (attempt < MaxRetries && !sentSuccessfully)
            //    {
            //        try
            //        {
            //            // Attempt to send the message
            //            sentSuccessfully = _channelSender.Send(fromPerson, toPerson, message, true, "", true, await GetAttachmentsAsync(message));

            //            if (sentSuccessfully)
            //            {
            //                // Successful send, exit the loop
            //                message.Status = RefListNotificationStatus.Sent;

            //                break;
            //            }
            //            else
            //            {
            //                Console.WriteLine($"Attempt {attempt + 1} to send notification failed.");
            //            }
            //        }
            //        catch (Exception ex)
            //        {
            //            message.ErrorMessage = $"Exception on attempt {attempt + 1} to send notification: {ex.Message}";
            //            Console.WriteLine($"Exception on attempt {attempt + 1} to send notification: {ex.Message}");
            //        }

            //        // Increment retry count and save to the database
            //        attempt++;
            //        message.RetryCount = attempt;
            //        message.ErrorMessage = $"Failed to send notification after {attempt} attempts.";
            //        message.Status = RefListNotificationStatus.Failed;

            //        using (var uow = StaticContext.IocManager.Resolve<IUnitOfWorkManager>().Begin())
            //        {
            //            using (var transaction = StaticContext.IocManager.Resolve<ISessionProvider>().Session.BeginTransaction())
            //            {
            //                await _notificationMessageRepository.UpdateAsync(message);
            //                transaction.Commit();
            //            }
            //            await uow.CompleteAsync();
            //        }

            //        // Introduce a delay before the next retry attempt
            //        if (attempt < MaxRetries)
            //        {
            //            await Task.Delay(1000); // Backoff delay
            //        }
            //    }

            //    if (!sentSuccessfully)
            //    {
            //        Console.WriteLine($"Failed to send notification after {MaxRetries} attempts.");
            //        //throw new Exception("Failed to send notification after maximum retry attempts.");
            //    }
            //}

        }


        [UnitOfWork]
        public async Task SendAsync(Person fromPerson, Person toPerson, OmoNotificationMessage message, bool isBodyHtml)
        {
            var _notificationMessageRepository = StaticContext.IocManager.Resolve<IRepository<OmoNotificationMessage, Guid>>();
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

    }
}
