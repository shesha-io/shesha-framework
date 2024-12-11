using Abp.BackgroundJobs;
using Abp.Domain.Repositories;
using Abp.Notifications;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.EntityReferences;
using Shesha.Notifications.Configuration;
using Shesha.Notifications.Dto;
using Shesha.Services;
using Shesha.Services.StoredFiles;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Notifications
{
    public class TestAppService: SheshaAppServiceBase
    {
        private readonly IRepository<NotificationChannelConfig, Guid> _notificationChannelRepository;
        private readonly IRepository<Notification, Guid> _notificationRepository;
        private readonly IRepository<NotificationMessage, Guid> _notificationMessageRepository;
        private readonly IRepository<NotificationMessageAttachment, Guid> _attachmentRepository;
        private readonly IRepository<NotificationTemplate, Guid> _messageTemplateRepository;
        private readonly IRepository<StoredFile, Guid> _storedFileRepository;
        private readonly IRepository<NotificationTypeConfig, Guid> _typeRepo;
        private readonly IRepository<Person, Guid> _personRepo;
        private readonly IStoredFileService _storedFileService;
        private readonly INotificationSender _notificationService;

        public TestAppService(IRepository<NotificationChannelConfig, Guid> notificationChannelRepository,
                                   IRepository<NotificationTemplate, Guid> messageTemplateRepository,
                                   IRepository<Notification, Guid> notificationRepository,
                                   IRepository<NotificationMessage, Guid> notificationMessageRepository,
                                   IRepository<NotificationMessageAttachment, Guid> attachmentRepository,
                                   IRepository<StoredFile, Guid> storedFileRepository,
                                   IRepository<NotificationTypeConfig, Guid> typeRepo,
                                   IRepository<Person, Guid> personRepo,
                                   IStoredFileService storedFileService,
                                   INotificationSender notificationService)
        {
            _notificationChannelRepository = notificationChannelRepository;
            _messageTemplateRepository = messageTemplateRepository;
            _notificationRepository = notificationRepository;
            _storedFileRepository = storedFileRepository;
            _attachmentRepository = attachmentRepository;
            _notificationMessageRepository = notificationMessageRepository;
            _typeRepo = typeRepo;
            _personRepo = personRepo;
            _storedFileService = storedFileService;
            _notificationService = notificationService;
        }

        public class TestData : NotificationData
        {
            public string subject { get; set; }
            public string name { get; set; }
            public string body { get; set; }
        }

        public async Task OmoTest()
        {
            var type = await _typeRepo.FirstOrDefaultAsync(x => x.Name == "Warning");
            var fromPerson = await _personRepo.FirstOrDefaultAsync(x => x.FirstName == "System");
            var toPerson = await _personRepo.FirstOrDefaultAsync(x => x.EmailAddress1 == "omolemo.lethuloe@boxfusion.io");
            //var channel = await _notificationChannelRepository.FirstOrDefaultAsync(x => x.Name == "SMS");
            var getAttachments = await _storedFileService.GetAttachmentsAsync(fromPerson.Id, "Shesha.Domain.Person");

            var attachments = getAttachments.Select(x => new NotificationAttachmentDto()
            {
                FileName = x.FileName,
                StoredFileId = x.Id,
            }).ToList();


            var testing = new TestData()
            {
                name = "Omolemo",
                subject = "Test Subject",
                body = "Test Body"
            };
            var triggeringEntity = new GenericEntityReference(fromPerson);
            await _notificationService.SendNotification(type, fromPerson, toPerson, data: testing, RefListNotificationPriority.High, attachments, triggeringEntity);
        }
    }
}
