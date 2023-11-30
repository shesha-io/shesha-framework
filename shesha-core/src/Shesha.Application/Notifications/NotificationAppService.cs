using Abp;
using Abp.BackgroundJobs;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Notifications;
using DocumentFormat.OpenXml.Vml.Office;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.AspNetCore.Mvc;
using NHibernate.Linq;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Dtos;
using Shesha.EntityReferences;
using Shesha.Notifications.Dto;
using Shesha.Services;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Threading.Tasks;

namespace Shesha.Notifications;

/// <summary>
/// Notification application service
/// </summary>
public class NotificationAppService : DynamicCrudAppService<Notification, DynamicDto<Notification, Guid>, Guid>, INotificationAppService
{
    private readonly INotificationPublisher _notificationPublisher;
    private readonly IBackgroundJobManager _backgroundJobManager;
    private readonly IStoredFileService _fileService;
    private readonly INotificationPublicationContext _notificationPublicationContext;
    private readonly IRepository<Notification, Guid> _repository;
    private readonly IRepository<NotificationTemplate, Guid> _templateRepository;
    private readonly IRepository<Person, Guid> _personRepository;

    public NotificationAppService(IRepository<Notification, Guid> repository, INotificationPublisher notificationPublisher, IBackgroundJobManager backgroundJobManager, IStoredFileService fileService, INotificationPublicationContext notificationPublicationContext, IRepository<NotificationTemplate, Guid> templateRepository, IRepository<Person, Guid> personRepository) : base(repository)
    {
        _notificationPublisher = notificationPublisher;
        _backgroundJobManager = backgroundJobManager;
        _fileService = fileService;
        _notificationPublicationContext = notificationPublicationContext;
        _repository = repository;
        _templateRepository = templateRepository;
        _personRepository = personRepository;

    }

    /// inheritedDoc
    public async Task PublishAsync(string notificationName,
        NotificationData data,
        List<Person> recipients,
        GenericEntityReference sourceEntity = null)
    {
        if (recipients == null)
            throw new Exception($"{nameof(recipients)} must not be null");

        var entityIdentifier = GetEntityIdentifier(sourceEntity);

        var userIds = recipients.Where(p => p.User != null)
            .Select(p => new UserIdentifier(AbpSession.TenantId, p.User.Id))
            .ToArray();
        if (!userIds.Any())
            return;

        await _notificationPublisher.PublishAsync(notificationName,
            data,
            userIds: userIds,
            entityIdentifier: entityIdentifier
        );
    }


    #region Direct email notifications

    /// <summary>
    /// Publish email notification
    /// </summary>
    /// <param name="notificationName">Name of the notification. Default email template of the specified notification will be used</param>
    /// <param name="data">Data that is used to fill template</param>
    /// <param name="emailAddress">Recipient email address</param>
    /// <param name="attachments">Notification attachments</param>
    /// <param name="sourceEntity">Optional parameter. If notification is an Entity level notification, specifies the entity the notification relates to.</param>
    /// <returns></returns>
    public async Task PublishEmailNotificationAsync<TData>(string notificationName,
        TData data,
        string emailAddress,
        List<NotificationAttachmentDto> attachments = null,
        GenericEntityReference sourceEntity = null) where TData : NotificationData
    {
        if (string.IsNullOrWhiteSpace(emailAddress))
            throw new Exception($"{nameof(emailAddress)} must not be null");

        var entityIdentifier = GetEntityIdentifier(sourceEntity);

        var wrappedData = new ShaNotificationData(data)
        {
            SendType = RefListNotificationType.Email,
            RecipientText = emailAddress,
            Attachments = attachments,
            SourceEntityId = sourceEntity.Id,
            SourceEntityClassName = sourceEntity._className,
            SourceEntityDisplayName = sourceEntity._displayName
        };
        await _notificationPublisher.PublishAsync(notificationName, wrappedData, entityIdentifier);
    }


    /// <summary>
    /// Publish email notification
    /// </summary>
    /// <param name="notificationName">Name of the notification. Default email template of the specified notification will be used</param>
    /// <param name="data">Data that is used to fill template</param>
    /// <param name="recipient">The person the email should go to</param>
    /// <param name="attachments">Notification attachments</param>
    /// <param name="sourceEntity">Optional parameter. If notification is an Entity level notification, specifies the entity the notification relates to.</param>
    /// <returns></returns>
    public async Task PublishEmailNotificationAsync<TData>(string notificationName,
        TData data,
        Person recipient,
        List<NotificationAttachmentDto> attachments = null,
        GenericEntityReference sourceEntity = null) where TData : NotificationData
    {

        if (recipient == null)
            throw new Exception($"{nameof(recipient)} must not be null");

        if (string.IsNullOrWhiteSpace(recipient.EmailAddress1) && string.IsNullOrWhiteSpace(recipient.EmailAddress2))
            throw new Exception($"No email address available for {recipient.FullName}");

        var emailAddress = string.IsNullOrWhiteSpace(recipient.EmailAddress1) ? recipient.EmailAddress2 : recipient.EmailAddress1;
        var entityIdentifier = GetEntityIdentifier(sourceEntity);

        var wrappedData = new ShaNotificationData(data)
        {
            SendType = RefListNotificationType.Email,
            RecipientText = emailAddress,
            Attachments = attachments,
            SourceEntityId = sourceEntity.Id,
            SourceEntityClassName = sourceEntity._className,
            SourceEntityDisplayName = sourceEntity._displayName
        };
        await _notificationPublisher.PublishAsync(notificationName, wrappedData, entityIdentifier);
    }

    /// <summary>
    /// Publish email notification using explicitly specified template
    /// </summary>
    /// <param name="templateId">Id of the template</param>
    /// <param name="data">Data that is used to fill template</param>
    /// <param name="emailAddress">Recipient email address</param>
    /// <param name="attachments">Attachments</param>
    /// <param name="sourceEntity">Optional parameter. If notification is an Entity level notification, specifies the entity the notification relates to.</param>
    /// <param name="cc"></param>
    /// <returns></returns>
    public async Task PublishEmailNotificationAsync<TData>(Guid templateId,
        TData data,
        string emailAddress,
        List<NotificationAttachmentDto> attachments = null,
        GenericEntityReference sourceEntity = null,
        string cc = "") where TData : NotificationData
    {
        if (string.IsNullOrWhiteSpace(emailAddress))
            throw new Exception($"{nameof(emailAddress)} must not be null");

        var entityIdentifier = GetEntityIdentifier(sourceEntity);

        var wrappedData = new ShaNotificationData(data)
        {
            SendType = RefListNotificationType.Email,
            RecipientText = emailAddress,
            TemplateId = templateId,
            Attachments = attachments,
            Cc = cc,
            SourceEntityId = sourceEntity?.Id,
            SourceEntityClassName = sourceEntity?._className,
            SourceEntityDisplayName = sourceEntity?._displayName,
        };

        await _notificationPublisher.PublishAsync("DirectEmail", wrappedData, entityIdentifier);
    }


    /// <summary>
    /// Publish email notification using explicitly specified template
    /// </summary>
    /// <param name="templateId">Id of the template</param>
    /// <param name="data">Data that is used to fill template</param>
    /// <param name="recipient">Receiptient of the notification</param>
    /// <param name="attachments">Attachments</param>
    /// <param name="sourceEntity">Optional parameter. If notification is an Entity level notification, specifies the entity the notification relates to.</param>
    /// <param name="cc"></param>
    /// <returns></returns>
    public async Task PublishEmailNotificationAsync<TData>(Guid templateId,
        TData data,
        Person recipient,
        List<NotificationAttachmentDto> attachments = null,
        GenericEntityReference sourceEntity = null,
        string cc = "") where TData : NotificationData
    {
        if (recipient == null)
            throw new Exception($"{nameof(recipient)} must not be null");

        if (string.IsNullOrWhiteSpace(recipient.EmailAddress1) && string.IsNullOrWhiteSpace(recipient.EmailAddress2))
            throw new Exception($"No email address available for {recipient.FullName}");

        var emailAddress = string.IsNullOrWhiteSpace(recipient.EmailAddress1) ? recipient.EmailAddress2 : recipient.EmailAddress1;
        var entityIdentifier = GetEntityIdentifier(sourceEntity);
        var wrappedData = new ShaNotificationData(data)
        {
            SendType = RefListNotificationType.Email,
            RecipientId = recipient?.Id ?? null,
            RecipientText = emailAddress,
            TemplateId = templateId,
            Attachments = attachments,
            Cc = cc,
            SourceEntityId = sourceEntity?.Id,
            SourceEntityClassName = sourceEntity?._className,
            SourceEntityDisplayName = sourceEntity?._displayName,
        };

        await _notificationPublisher.PublishAsync("DirectEmail", wrappedData, entityIdentifier);
    }

    #endregion

    #region Direct sms notifications

    /// <summary>
    /// Publish sms notification
    /// </summary>
    /// <param name="notificationName">Name of the notification. Default email template of the specified notification will be used</param>
    /// <param name="data">Data that is used to fill template</param>
    /// <param name="mobileNo">Recipient mobile number</param>
    /// <param name="sourceEntity">Optional parameter. If notification is an Entity level notification, specifies the entity the notification relates to.</param>
    /// <returns></returns>
    public async Task PublishSmsNotificationAsync<TData>(string notificationName,
        TData data,
        string mobileNo,
        GenericEntityReference sourceEntity = null) where TData : NotificationData
    {
        if (string.IsNullOrWhiteSpace(mobileNo))
            throw new Exception($"{nameof(mobileNo)} must not be null");

        var entityIdentifier = GetEntityIdentifier(sourceEntity);

        var wrappedData = new ShaNotificationData(data)
        {
            SendType = RefListNotificationType.SMS,
            RecipientText = mobileNo,
            SourceEntityId = sourceEntity.Id,
            SourceEntityClassName = sourceEntity._className,
            SourceEntityDisplayName = sourceEntity._displayName
        };
        await _notificationPublisher.PublishAsync(notificationName, wrappedData, entityIdentifier);
    }

    /// <summary>
    /// Publish sms notification
    /// </summary>
    /// <param name="notificationName">Name of the notification. Default email template of the specified notification will be used</param>
    /// <param name="data">Data that is used to fill template</param>
    /// <param name="recipient">Receiptient of the notification</param>
    /// <param name="sourceEntity">Optional parameter. If notification is an Entity level notification, specifies the entity the notification relates to.</param>
    /// <returns></returns>
    public async Task PublishSmsNotificationAsync<TData>(string notificationName,
        TData data,
        Person recipient,
        GenericEntityReference sourceEntity = null) where TData : NotificationData
    {
        if (recipient == null)
            throw new Exception($"{nameof(recipient)} must not be null");

        if (string.IsNullOrWhiteSpace(recipient.MobileNumber1) && string.IsNullOrWhiteSpace(recipient.MobileNumber2))
            throw new Exception($"No mobile number available for {recipient.FullName}");

        var mobileNumber = string.IsNullOrWhiteSpace(recipient.MobileNumber1) ? recipient.MobileNumber2 : recipient.MobileNumber1;
        var entityIdentifier = GetEntityIdentifier(sourceEntity);
        var wrappedData = new ShaNotificationData(data)
        {
            SendType = RefListNotificationType.SMS,
            RecipientId = recipient?.Id ?? null,
            RecipientText = mobileNumber,
            SourceEntityId = sourceEntity.Id,
            SourceEntityClassName = sourceEntity._className,
            SourceEntityDisplayName = sourceEntity._displayName
        };
        await _notificationPublisher.PublishAsync(notificationName, wrappedData, entityIdentifier);
    }

    /// <summary>
    /// Publish sms notification using explicitly specified template
    /// </summary>
    /// <param name="templateId">Id of the template</param>
    /// <param name="data">Data that is used to fill template</param>
    /// <param name="mobileNo">Recipient mobile number</param>
    /// <param name="sourceEntity">Optional parameter. If notification is an Entity level notification, specifies the entity the notification relates to.</param>
    /// <returns></returns>
    public async Task PublishSmsNotificationAsync<TData>(Guid templateId,
        TData data,
        string mobileNo,
        GenericEntityReference sourceEntity = null
        ) where TData : NotificationData
    {
        if (string.IsNullOrWhiteSpace(mobileNo))
            throw new Exception($"{nameof(mobileNo)} must not be null");

        var entityIdentifier = GetEntityIdentifier(sourceEntity);

        var wrappedData = new ShaNotificationData(data)
        {
            SendType = RefListNotificationType.SMS,
            RecipientText = mobileNo,
            TemplateId = templateId,
            SourceEntityId = sourceEntity.Id,
            SourceEntityClassName = sourceEntity._className,
            SourceEntityDisplayName = sourceEntity._displayName
        };
        await _notificationPublisher.PublishAsync(templateId.ToString(), wrappedData, entityIdentifier);
    }

    /// <summary>
    /// Publish sms notification using explicitly specified template
    /// </summary>
    /// <param name="templateId">Id of the template</param>
    /// <param name="data">Data that is used to fill template</param>
    /// <param name="recipient">Receiptient of the notification</param>
    /// <param name="sourceEntity">Optional parameter. If notification is an Entity level notification, specifies the entity the notification relates to.</param>
    /// <returns></returns>
    public async Task PublishSmsNotificationAsync<TData>(Guid templateId,
        TData data,
        Person recipient,
        GenericEntityReference sourceEntity = null
        ) where TData : NotificationData
    {
        if (recipient == null)
            throw new Exception($"{nameof(recipient)} must not be null");

        if (string.IsNullOrWhiteSpace(recipient.MobileNumber1) && string.IsNullOrWhiteSpace(recipient.MobileNumber2))
            throw new Exception($"No mobile number available for {recipient.FullName}");

        var mobileNumber = string.IsNullOrWhiteSpace(recipient.MobileNumber1) ? recipient.MobileNumber2 : recipient.MobileNumber1;
        var entityIdentifier = GetEntityIdentifier(sourceEntity);
        var wrappedData = new ShaNotificationData(data)
        {
            SendType = RefListNotificationType.SMS,
            RecipientId = recipient?.Id ?? null,
            RecipientText = mobileNumber,
            TemplateId = templateId,
            SourceEntityId = sourceEntity.Id,
            SourceEntityClassName = sourceEntity._className,
            SourceEntityDisplayName = sourceEntity._displayName
        };
        await _notificationPublisher.PublishAsync(templateId.ToString(), wrappedData, entityIdentifier);
    }

    //private static EntityIdentifier GetEntityIdentifier(object entity)
    //{
    //    EntityIdentifier entityIdentifier = null;
    //    if (entity is not null)
    //    {
    //        if (entity is Entity<Guid>)
    //            entityIdentifier = new EntityIdentifier(entity.GetType(), ((Entity<Guid>)entity).Id);
    //        else if (entity is Entity<long>)
    //            entityIdentifier = new EntityIdentifier(entity.GetType(), ((Entity<long>)entity).Id);
    //        else if (entity is Entity<int>)
    //            entityIdentifier = new EntityIdentifier(entity.GetType(), ((Entity<int>)entity).Id);
    //    }

    //    return entityIdentifier;
    //}

    private static EntityIdentifier GetEntityIdentifier(GenericEntityReference genericEntity)
    {
        EntityIdentifier entityIdentifier = null;

        if (genericEntity != null)
        {
            Entity<Guid> entity = genericEntity;
            entityIdentifier = new EntityIdentifier(entity.GetType(), entity.Id);
        }

        return entityIdentifier;
    }

    #endregion

    #region Direct Push notifications

    /// <summary>
    /// Publish Push notification
    /// </summary>
    /// <param name="notificationName">Name of the notification. Default push template of the specified notification will be used</param>
    /// <param name="data">Data that is used to fill template</param>
    /// <param name="personId">Recipient person id</param>
    /// <param name="attachments">Notification attachments</param>
    /// <param name="sourceEntity">Optional parameter. If notification is an Entity level notification, specifies the entity the notification relates to.</param>
    /// <returns></returns>
    public async Task PublishPushNotificationAsync<TData>(string notificationName,
        TData data,
        string personId,
        List<NotificationAttachmentDto> attachments = null,
        GenericEntityReference sourceEntity = null) where TData : NotificationData
    {
        if (string.IsNullOrWhiteSpace(personId))
            throw new Exception($"{nameof(personId)} must not be null");

        var entityIdentifier = GetEntityIdentifier(sourceEntity);

        var wrappedData = new ShaNotificationData(data)
        {
            SendType = RefListNotificationType.Push,
            RecipientId = string.IsNullOrEmpty(personId) ? null : new Guid(personId),
            RecipientText = personId,
            Attachments = attachments,
            SourceEntityId = sourceEntity.Id,
            SourceEntityClassName = sourceEntity._className,
            SourceEntityDisplayName = sourceEntity._displayName
        };
        await _notificationPublisher.PublishAsync(notificationName, wrappedData, entityIdentifier);
    }

    /// <summary>
    /// Publish Push notification using explicitly specified template
    /// </summary>
    /// <param name="templateId">Id of the template</param>
    /// <param name="data">Data that is used to fill template</param>
    /// <param name="personId">Recipient person id</param>
    /// <param name="attachments">Attachments</param>
    /// <param name="sourceEntity">Optional parameter. If notification is an Entity level notification, specifies the entity the notification relates to.</param>
    /// <returns></returns>
    public async Task PublishPushNotificationAsync<TData>(Guid templateId,
        TData data,
        string personId,
        List<NotificationAttachmentDto> attachments = null,
        GenericEntityReference sourceEntity = null) where TData : NotificationData
    {
        if (string.IsNullOrWhiteSpace(personId))
            throw new Exception($"{nameof(personId)} must not be null");

        var entityIdentifier = GetEntityIdentifier(sourceEntity);

        var wrappedData = new ShaNotificationData(data)
        {
            SendType = RefListNotificationType.Push,
            RecipientId = string.IsNullOrEmpty(personId) ? null : new Guid(personId),
            RecipientText = personId,
            TemplateId = templateId,
            Attachments = attachments,
            SourceEntityId = sourceEntity.Id,
            SourceEntityClassName = sourceEntity._className,
            SourceEntityDisplayName = sourceEntity._displayName
        };
        await _notificationPublisher.PublishAsync(templateId.ToString(), wrappedData, entityIdentifier);
    }

    #endregion

    /// <summary>
    /// Note: for temporary usage only
    /// </summary>
    /// <param name="ids"></param>
    /// <returns></returns>
    public async Task ReSendAbpNotification(List<Guid> ids)
    {
        foreach (var id in ids)
        {
            await _backgroundJobManager.EnqueueAsync<NotificationDistributionJob, NotificationDistributionJobArgs>(
                new NotificationDistributionJobArgs(
                    id
                )
            );
        }
    }

    /// <summary>
    /// Save notification attachment
    /// </summary>
    public async Task<NotificationAttachmentDto> SaveAttachmentAsync(string fileName, Stream stream)
    {
        var file = await _fileService.SaveFileAsync(stream, fileName);
        return new NotificationAttachmentDto()
        {
            FileName = fileName,
            StoredFileId = file.Id
        };
    }

    #region new notififiers
    /// <summary>
    /// Send Notification to specified person
    /// </summary>
    public async Task<Guid?> SendNotification<TData>(string notificationName, Person recipient, TData data, RefListNotificationType? notificationType = null, GenericEntityReference sourceEntity = null, List<NotificationAttachmentDto> attachments = null, string cc = "") where TData : NotificationData
    {

        if (notificationType != null)
        {
            return await SendNotificationByType(notificationName, (int)notificationType, recipient, data, sourceEntity, attachments, cc);
        }
        else
        {
            if (recipient.PreferredContactMethod != null)
            {
                return await SendNotificationByType(notificationName, (int)recipient.PreferredContactMethod, recipient, data, sourceEntity, attachments, cc);
            }
            else
            {
                await SendNotificationByType(notificationName, (int)RefListNotificationType.SMS, recipient, data, sourceEntity, attachments);
                await SendNotificationByType(notificationName, (int)RefListNotificationType.Push, recipient, data, sourceEntity, attachments);
                return await SendNotificationByType(notificationName, (int)RefListNotificationType.Email, recipient, data, sourceEntity, attachments, cc);
            }
        }
    }

    private async Task<Guid?> SendNotificationByType<TData>(string notificationName, int notificationType, Person person, TData data, GenericEntityReference sourceEntity = null, List<NotificationAttachmentDto> attachments = null, string cc = "") where TData : NotificationData
    {
        var notification = await _repository.GetAll().FirstOrDefaultAsync(e => e.Name == notificationName);
        var templates = await _templateRepository.GetAllListAsync(e => e.Notification == notification);

        var template = templates.FirstOrDefault(e => (int)e.SendType == notificationType);
        if (template != null)
        {
            switch (notificationType)
            {
                case (int)RefListNotificationType.Email:
                    return await SendEmailAsync(template.Id, recipient: person, data, sourceEntity: sourceEntity, attachments: attachments, cc: cc);
                case (int)RefListNotificationType.SMS:
                    return await SendSmsAsync(template.Id, recipient: person, data, sourceEntity: sourceEntity);
                case (int)RefListNotificationType.Push:
                    return await SendPushAsync(template.Id, person.Id, data, sourceEntity: sourceEntity, recipient: person);
                default:
                    break;
            }
        }

        return null;
    }

    private async Task<Guid?> SendSmsAsync<TData>(Guid notificationTemplate, string mobileNumber, TData data, GenericEntityReference sourceEntity = null, Person recipient = null) where TData : NotificationData
    {
        Guid? messageId = Guid.Empty;

        using (_notificationPublicationContext.BeginScope())
        {
            await PublishSmsNotificationAsync(
            templateId: notificationTemplate,
            data: data,
            mobileNo: mobileNumber,
            sourceEntity: sourceEntity
            );

            messageId = _notificationPublicationContext.Statistics.NotificationMessages.FirstOrDefault()?.Id;
        }

        return messageId;
    }

    private async Task<Guid?> SendSmsAsync<TData>(Guid notificationTemplate, Person recipient, TData data, GenericEntityReference sourceEntity = null) where TData : NotificationData
    {
        Guid? messageId = Guid.Empty;

        using (_notificationPublicationContext.BeginScope())
        {
            await PublishSmsNotificationAsync(
            templateId: notificationTemplate,
            data: data,
            sourceEntity: sourceEntity,
            recipient: recipient
            );

            messageId = _notificationPublicationContext.Statistics.NotificationMessages.FirstOrDefault()?.Id;
        }

        return messageId;
    }

    private async Task<Guid?> SendEmailAsync<TData>(Guid notificationTemplate, string emailAddress, TData data, GenericEntityReference sourceEntity = null, List<NotificationAttachmentDto> attachments = null, string cc = "" ) where TData : NotificationData
    {
        Guid? messageId = Guid.Empty;

        using (_notificationPublicationContext.BeginScope())
        {
            await PublishEmailNotificationAsync(
                templateId: notificationTemplate,
                data: data,
                attachments: attachments,
                emailAddress: emailAddress,
                sourceEntity: sourceEntity,
                cc: cc);

            messageId = _notificationPublicationContext.Statistics.NotificationMessages.FirstOrDefault()?.Id;
        }

        return messageId;
    }

    private async Task<Guid?> SendEmailAsync<TData>(Guid notificationTemplate, Person recipient, TData data, GenericEntityReference sourceEntity = null, List<NotificationAttachmentDto> attachments = null, string cc = "") where TData : NotificationData
    {
        Guid? messageId = Guid.Empty;
        using (_notificationPublicationContext.BeginScope())
        {
            await PublishEmailNotificationAsync(
                templateId: notificationTemplate,
                data: data,
                attachments: attachments,
                sourceEntity: sourceEntity,
                recipient: recipient,
                cc: cc);

            messageId = _notificationPublicationContext.Statistics.NotificationMessages.FirstOrDefault()?.Id;
        }

        return messageId;
    }

    private async Task<Guid?> SendPushAsync<TData>(Guid notificationTemplate, Guid personId, TData data, GenericEntityReference sourceEntity = null, List<NotificationAttachmentDto> attachments = null, Person recipient = null) where TData : NotificationData
    {
        Guid? messageId = Guid.Empty;

        using (_notificationPublicationContext.BeginScope())
        {
            await PublishPushNotificationAsync(
                templateId: notificationTemplate,
                data: data,
                attachments: attachments,
                personId: personId.ToString(),
                sourceEntity: sourceEntity
                );

            messageId = _notificationPublicationContext.Statistics.NotificationMessages.FirstOrDefault()?.Id;
        }

        return messageId;
    }

    #endregion
}