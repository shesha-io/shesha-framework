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

        /// <summary>
        /// 
        /// </summary>
        /// <param name="fromPerson"></param>
        /// <param name="toPerson"></param>
        /// <param name="message"></param>
        /// <param name="notificationChannelSender"></param>
        /// <returns></returns>
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
                    message.RecipientText = notificationChannelSender.GetRecipientId(toPerson);

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

                await _notificationMessageRepository.UpdateAsync(message);

                _unitOfWorkManager.Current.SaveChanges();
            }
            catch (Exception ex)
            {
                message.Status = RefListNotificationStatus.Failed;
                message.ErrorMessage = $"Exception while sending notification: {ex.Message}";
                message.RetryCount++;

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

            // Schedule the next retry job
            BackgroundJob.Enqueue<DirectNotificationJobQueuer>(x => x.ExecuteAsync(jobArgs));
        }
    }
}
