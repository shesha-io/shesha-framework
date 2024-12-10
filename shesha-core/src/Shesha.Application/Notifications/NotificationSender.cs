using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Castle.Core.Logging;
using DocumentFormat.OpenXml.Office2010.Excel;
using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Wordprocessing;
using Hangfire;
using NHibernate.Engine;
using NHibernate.Linq;
using Shesha.Configuration;
using Shesha.Configuration.Email;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Email.Dtos;
using Shesha.NHibernate;
using Shesha.Notifications.Dto;
using Shesha.Notifications.Exceptions;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.IO.Pipelines;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Notifications
{
    public class NotificationSender: INotificationSender, ITransientDependency
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
        [AutomaticRetry(Attempts = 3)]
        public async Task SendAsync(Person fromPerson, Person toPerson, NotificationMessage message, INotificationChannelSender notificationChannelSender)
        {
            var attachments = await GetAttachmentsAsync(message);

            // Use TrySendAsync to handle the send attempt
            var sendResult = await TrySendAsync(fromPerson, toPerson, message, notificationChannelSender, attachments);

            if (sendResult.IsSuccess)
            {
                message.Status = RefListNotificationStatus.Sent;
                message.ErrorMessage = null; // Clear any previous error
                message.DateSent = DateTime.Now;
            }
            else
            {
                message.RetryCount++;
                message.Status = message.RetryCount < 3 ? RefListNotificationStatus.WaitToRetry : RefListNotificationStatus.Failed;
                message.ErrorMessage = sendResult.Message;

                if (message.Status == RefListNotificationStatus.WaitToRetry)
                    throw new ShaMessageFailedWaitRetryException(message.Id);
            }

            message.RecipientText = notificationChannelSender.GetRecipientId(toPerson);

            await _notificationMessageRepository.UpdateAsync(message);
            _unitOfWorkManager.Current.SaveChanges();
        }

        /// <summary>
        /// Attempts to send a notification and handles exceptions internally.
        /// </summary>
        private async Task<SendStatus> TrySendAsync(
            Person fromPerson,
            Person toPerson,
            NotificationMessage message,
            INotificationChannelSender notificationChannelSender,
            List<EmailAttachment> attachments)
        {
            try
            {
                var sendStatus = await notificationChannelSender.SendAsync(fromPerson, toPerson, message, "", attachments);

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
    }
}
