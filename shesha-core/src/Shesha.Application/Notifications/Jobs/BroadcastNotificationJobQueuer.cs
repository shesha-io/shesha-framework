using Abp.BackgroundJobs;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Notifications;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Dtos;
using Shesha.Email.Dtos;
using Shesha.NHibernate;
using Shesha.Notifications.Dto;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Notifications.Jobs
{
    public class BroadcastNotificationJobQueuer : AsyncBackgroundJob<BroadcastNotificationJobArgs>, ITransientDependency
    {  
        private readonly IRepository<NotificationTopic, Guid> _notificationTopicRepository;
        private readonly IRepository<Notification, Guid> _notificationRepository;
        private readonly IRepository<NotificationTemplate, Guid> _notificationTemplateRepository;
        private readonly IRepository<NotificationChannelConfig, Guid> _notificationChannelRepository;
        private readonly IRepository<UserTopicSubscription, Guid> _userTopicSubscriptionRepository;
        private readonly IRepository<NotificationMessage, Guid> _notificationMessage;
        private readonly IRepository<NotificationMessageAttachment, Guid> _attachmentRepository;
        private readonly IEnumerable<INotificationChannelSender> _channelSenders;
        private readonly IRepository<StoredFile, Guid> _storedFileRepository;
        private readonly IStoredFileService _fileService;
        private readonly ISessionProvider _sessionProvider;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly INotificationSender _notificationSender;

        public BroadcastNotificationJobQueuer(IRepository<NotificationTopic, Guid> notificationTopicRepository, 
                                              IRepository<Notification, Guid> notificationRepository, 
                                              IRepository<NotificationChannelConfig, Guid> notificationChannelRepository, 
                                              IRepository<StoredFile, Guid> storedFileRepository, 
                                              IRepository<NotificationMessageAttachment, Guid> attachmentRepository, 
                                              IRepository<NotificationTemplate, Guid> notificationTemplateRepository, 
                                              IRepository<UserTopicSubscription, Guid> userTopicSubscriptionRepository, 
                                              IRepository<NotificationMessage, Guid> notificationMessage, 
                                              IEnumerable<INotificationChannelSender> channelSenders,
                                              IStoredFileService fileService,
                                              ISessionProvider sessionProvider,
                                              IUnitOfWorkManager unitOfWorkManager,
                                              INotificationSender notificationSender)
        {
            _notificationMessage = notificationMessage;
            _notificationTopicRepository = notificationTopicRepository;
            _channelSenders = channelSenders;
            _notificationRepository = notificationRepository;
            _userTopicSubscriptionRepository = userTopicSubscriptionRepository;
            _notificationTemplateRepository = notificationTemplateRepository;
            _attachmentRepository = attachmentRepository;
            _storedFileRepository = storedFileRepository;
            _notificationChannelRepository = notificationChannelRepository;
            _fileService = fileService;
            _sessionProvider = sessionProvider;
            _unitOfWorkManager = unitOfWorkManager;
            _notificationSender = notificationSender;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="args"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        [UnitOfWork]
        public override async Task ExecuteAsync(BroadcastNotificationJobArgs args)
        {
            var notification = await _notificationRepository.GetAsync(args.NotificationId);

            var template = await _notificationTemplateRepository.GetAsync(args.TemplateId);

            var channel = await _notificationChannelRepository.GetAsync(args.ChannelId);

            var message = await SaveUserNotificationMessagesAsync(notification, template, channel, args.Subject, args.Message, args.Attachments);

            var senderChannelInterface = _channelSenders.FirstOrDefault(x => x.GetType().Name == channel.SenderTypeName);
            if (senderChannelInterface == null)
                throw new Exception($"No sender found for sender type: {channel.SenderTypeName}");

            await _notificationSender.SendBroadcastAsync(notification, message.Subject, message.Message, message.Attachments, senderChannelInterface);
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="notification"></param>
        /// <param name="template"></param>
        /// <param name="channel"></param>
        /// <param name="subject"></param>
        /// <param name="message"></param>
        /// <param name="attachments"></param>
        /// <returns></returns>
        public async Task<NotificationMessageDto> SaveUserNotificationMessagesAsync(Notification notification, NotificationTemplate template, NotificationChannelConfig channel, string subject, string message, List<NotificationAttachmentDto> attachments)
        {
            var users = await _userTopicSubscriptionRepository.GetAllListAsync(x => x.Topic.Id == notification.NotificationTopic.Id);
            var notificationMessageDto = new NotificationMessageDto()
            {
                Message = message,
                Subject = subject
            };

            foreach (var user in users)
            {
                var notificationMessage = new NotificationMessage
                {
                    Subject = subject,
                    Message = message,
                    ReadStatus = RefListNotificationReadStatus.Unread,
                    Direction = RefListNotificationDirection.Outgoing,
                    Status = RefListNotificationStatus.Preparing,
                    Channel = channel
                };

                await _notificationMessage.InsertAsync(notificationMessage);
                await CurrentUnitOfWork.SaveChangesAsync();

                if (attachments != null)
                {
                    foreach (var attachmentDto in attachments)
                    {
                        var file = await _storedFileRepository.GetAsync(attachmentDto.StoredFileId);
                        var attachment = new NotificationMessageAttachment
                        {
                            Message = notificationMessage,
                            File = file,
                            FileName = attachmentDto.FileName
                        };

                        await _attachmentRepository.InsertAsync(attachment);
                        notificationMessageDto.Attachments.Add(new EmailAttachment(attachmentDto.FileName, _fileService.GetStream(file)));
                    }
                }

                await CurrentUnitOfWork.SaveChangesAsync();
            }
            return notificationMessageDto;
        }
    }
}
