using Abp;
using Abp.BackgroundJobs;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Notifications;
using Microsoft.AspNetCore.Mvc;
using NHibernate.Linq;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Notifications.Dto;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Notifications;

/// <summary>
/// Notification application service
/// </summary>
public class NotificationAppService: SheshaCrudServiceBase<Notification, NotificationDto, Guid>, INotificationAppService
{
    private readonly INotificationPublisher _notificationPublisher;
    private readonly IBackgroundJobManager _backgroundJobManager;
    private readonly IStoredFileService _fileService;

    public NotificationAppService(IRepository<Notification, Guid> repository, INotificationPublisher notificationPublisher, IBackgroundJobManager backgroundJobManager, IStoredFileService fileService) : base(repository)
    {
        _notificationPublisher = notificationPublisher;
        _backgroundJobManager = backgroundJobManager;
        _fileService = fileService;
    }

    /// inheritedDoc
    public async Task PublishAsync(string notificationName,
        NotificationData data,
        List<Person> recipients,
        object sourceEntity = null)
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

    /// <summary>
    /// Notifications autocomplete
    /// </summary>
    /// <param name="term"></param>
    /// <returns></returns>
    [HttpGet]
    public async Task<List<AutocompleteItemDto>> Autocomplete(string term)
    {
        term = (term ?? "").ToLower();

        var notifications = await Repository.GetAll()
            .Where(p => (p.Name ?? "").ToLower().Contains(term))
            .OrderBy(p => p.Name)
            .Take(10)
            .Select(p => new AutocompleteItemDto
            {
                DisplayText = p.Name.Trim(),
                Value = p.Id.ToString()
            })
            .ToListAsync();

        return notifications;
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
        object sourceEntity = null) where TData: NotificationData
    {
        if (string.IsNullOrWhiteSpace(emailAddress))
            throw new Exception($"{nameof(emailAddress)} must not be null");

        var entityIdentifier = GetEntityIdentifier(sourceEntity);

        var wrappedData = new ShaNotificationData(data)
        {
            SendType = RefListNotificationType.Email,
            RecipientText = emailAddress,
            Attachments = attachments
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
    /// <returns></returns>
    public async Task PublishEmailNotificationAsync<TData>(Guid templateId,
        TData data,
        string emailAddress,
        List<NotificationAttachmentDto> attachments = null,
        object sourceEntity = null) where TData : NotificationData
    {
        if (string.IsNullOrWhiteSpace(emailAddress))
            throw new Exception($"{nameof(emailAddress)} must not be null");

        var entityIdentifier = GetEntityIdentifier(sourceEntity);

        var wrappedData = new ShaNotificationData(data)
        {
            SendType = RefListNotificationType.Email,
            RecipientText = emailAddress,
            TemplateId = templateId,
            Attachments = attachments
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
        object sourceEntity = null) where TData : NotificationData
    {
        if (string.IsNullOrWhiteSpace(mobileNo))
            throw new Exception($"{nameof(mobileNo)} must not be null");

        var entityIdentifier = GetEntityIdentifier(sourceEntity);

        var wrappedData = new ShaNotificationData(data)
        {
            SendType = RefListNotificationType.SMS,
            RecipientText = mobileNo
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
        object sourceEntity = null
        ) where TData : NotificationData
    {
        if (string.IsNullOrWhiteSpace(mobileNo))
            throw new Exception($"{nameof(mobileNo)} must not be null");

        var entityIdentifier = GetEntityIdentifier(sourceEntity);

        var wrappedData = new ShaNotificationData(data)
        {
            SendType = RefListNotificationType.SMS,
            RecipientText = mobileNo,
            TemplateId = templateId
        };
        await _notificationPublisher.PublishAsync(templateId.ToString(), wrappedData, entityIdentifier);
    }

    private static EntityIdentifier GetEntityIdentifier(object entity)
    {
        EntityIdentifier entityIdentifier = null;
        if (entity is not null)
        {
            if (entity is Entity<Guid>)
                entityIdentifier = new EntityIdentifier(entity.GetType(), ((Entity<Guid>)entity).Id);
            else if (entity is Entity<long>)
                entityIdentifier = new EntityIdentifier(entity.GetType(), ((Entity<long>)entity).Id);
            else if (entity is Entity<int>)
                entityIdentifier = new EntityIdentifier(entity.GetType(), ((Entity<int>)entity).Id);
        }

        return entityIdentifier;
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
}