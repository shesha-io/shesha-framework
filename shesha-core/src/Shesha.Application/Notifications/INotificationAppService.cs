using Abp.Notifications;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Dtos;
using Shesha.EntityReferences;
using Shesha.Notifications.Dto;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace Shesha.Notifications
{
    /// <summary>
    /// Notification service
    /// </summary>
    public interface INotificationAppService: IDynamicCrudAppService<Notification, DynamicDto<Notification, Guid>, Guid>
    {
        /// <summary>
        /// Publish new notification
        /// </summary>
        /// <param name="notificationName">Name of the notification</param>
        /// <param name="data">Notification data (is used in templates)</param>
        /// <param name="recipients">list of recipients</param>
        /// <param name="sourceEntity">Optional parameter. If notification is an Entity level notification, specifies the entity the notification relates to.</param>
        /// <returns></returns>
        Task PublishAsync(string notificationName, NotificationData data, List<Person> recipients, GenericEntityReference sourceEntity = null);

        /// <summary>
        /// Publish email notification
        /// </summary>
        /// <param name="notificationName">Name of the notification. Default email template of the specified notification will be used</param>
        /// <param name="data">Data that is used to fill template</param>
        /// <param name="emailAddress">Recipient email address</param>
        /// <param name="attachments">Notification attachments</param>
        /// <param name="sourceEntity">Optional parameter. If notification is an Entity level notification, specifies the entity the notification relates to.</param>
        /// <returns></returns>
        Task PublishEmailNotificationAsync<TData>(string notificationName, TData data, string emailAddress, List<NotificationAttachmentDto> attachments, GenericEntityReference sourceEntity = null) where TData : NotificationData;

        /// <summary>
        /// Publish email notification
        /// </summary>
        /// <param name="notificationName">Name of the notification. Default email template of the specified notification will be used</param>
        /// <param name="data">Data that is used to fill template</param>
        /// <param name="recipient">The person the email should go to</param>
        /// <param name="attachments">Notification attachments</param>
        /// <param name="sourceEntity">Optional parameter. If notification is an Entity level notification, specifies the entity the notification relates to.</param>
        /// <returns></returns>
        Task PublishEmailNotificationAsync<TData>(string notificationName, TData data, Person recipient, List<NotificationAttachmentDto> attachments, GenericEntityReference sourceEntity = null) where TData : NotificationData;

        /// <summary>
        /// Publish email notification using explicitly specified template
        /// </summary>
        /// <param name="templateId">Id of the template</param>
        /// <param name="data">Data that is used to fill template</param>
        /// <param name="emailAddress">Recipient email address</param>
        /// <param name="attachments">Notification attachments</param>
        /// <param name="sourceEntity">Optional parameter. If notification is an Entity level notification, specifies the entity the notification relates to.</param>
        /// <param name="cc"></param>
        /// <returns></returns>
        Task PublishEmailNotificationAsync<TData>(Guid templateId, TData data, string emailAddress, List<NotificationAttachmentDto> attachments, GenericEntityReference sourceEntity = null, string cc = "") where TData : NotificationData;

        /// <summary>
        /// Publish email notification using explicitly specified template
        /// </summary>
        /// <param name="templateId">Id of the template</param>
        /// <param name="data">Data that is used to fill template</param>
        /// <param name="recipient">Receiptient of the notification</param>
        /// <param name="attachments">Notification attachments</param>
        /// <param name="sourceEntity">Optional parameter. If notification is an Entity level notification, specifies the entity the notification relates to.</param>
        /// <param name="cc"></param>
        /// <returns></returns>
        Task PublishEmailNotificationAsync<TData>(Guid templateId, TData data, Person recipient, List<NotificationAttachmentDto> attachments, GenericEntityReference sourceEntity = null, string cc = "") where TData : NotificationData;

        /// <summary>
        /// Publish sms notification
        /// </summary>
        /// <param name="notificationName">Name of the notification. Default email template of the specified notification will be used</param>
        /// <param name="data">Data that is used to fill template</param>
        /// <param name="mobileNo">Recipient mobile number</param>
        /// <param name="sourceEntity">Optional parameter. If notification is an Entity level notification, specifies the entity the notification relates to.</param>
        /// <returns></returns>
        Task PublishSmsNotificationAsync<TData>(string notificationName, TData data, string mobileNo, GenericEntityReference sourceEntity = null) where TData : NotificationData;


        /// <summary>
        /// Publish sms notification
        /// </summary>
        /// <param name="notificationName">Name of the notification. Default email template of the specified notification will be used</param>
        /// <param name="data">Data that is used to fill template</param>
        /// <param name="recipient">Recipient of the notification</param>
        /// <param name="sourceEntity">Optional parameter. If notification is an Entity level notification, specifies the entity the notification relates to.</param>
        /// <returns></returns>
        Task PublishSmsNotificationAsync<TData>(string notificationName, TData data, Person recipient, GenericEntityReference sourceEntity = null) where TData : NotificationData;


        /// <summary>
        /// Publish sms notification using explicitly specified template
        /// </summary>
        /// <param name="templateId">Id of the template</param>
        /// <param name="data">Data that is used to fill template</param>
        /// <param name="mobileNo">Recipient mobile number</param>
        /// <param name="sourceEntity">Optional parameter. If notification is an Entity level notification, specifies the entity the notification relates to.</param>
        /// <returns></returns>
        Task PublishSmsNotificationAsync<TData>(Guid templateId, TData data, string mobileNo, GenericEntityReference sourceEntity = null) where TData : NotificationData;

        /// <summary>
        /// Publish sms notification using explicitly specified template
        /// </summary>
        /// <param name="templateId">Id of the template</param>
        /// <param name="data">Data that is used to fill template</param>
        /// <param name="recipient">Recipient of the notification</param>
        /// <param name="sourceEntity">Optional parameter. If notification is an Entity level notification, specifies the entity the notification relates to.</param>
        /// <returns></returns>
        Task PublishSmsNotificationAsync<TData>(Guid templateId, TData data, Person recipient, GenericEntityReference sourceEntity = null) where TData : NotificationData;

        /// <summary>
        /// Publish email notification
        /// </summary>
        /// <param name="notificationName">Name of the notification. Default email template of the specified notification will be used</param>
        /// <param name="data">Data that is used to fill template</param>
        /// <param name="personId">Recipient person id</param>
        /// <param name="attachments">Notification attachments</param>
        /// <param name="sourceEntity">Optional parameter. If notification is an Entity level notification, specifies the entity the notification relates to.</param>
        /// <returns></returns>
        Task PublishPushNotificationAsync<TData>(string notificationName, TData data, string personId, List<NotificationAttachmentDto> attachments = null, GenericEntityReference sourceEntity = null) where TData : NotificationData;

        /// <summary>
        /// Publish email notification using explicitly specified template
        /// </summary>
        /// <param name="templateId">Id of the template</param>
        /// <param name="data">Data that is used to fill template</param>
        /// <param name="personId">Recipient person id</param>
        /// <param name="attachments">Notification attachments</param>
        /// <param name="sourceEntity">Optional parameter. If notification is an Entity level notification, specifies the entity the notification relates to.</param>
        /// <returns></returns>
        Task PublishPushNotificationAsync<TData>(Guid templateId, TData data, string personId, List<NotificationAttachmentDto> attachments = null, GenericEntityReference sourceEntity = null) where TData : NotificationData;


        /// <summary>
        /// Save notification attachment
        /// </summary>
        Task<NotificationAttachmentDto> SaveAttachmentAsync(string fileName, Stream stream);

        /// <summary>
        /// Send Notification to specified person
        /// </summary>
        Task<Guid?> SendNotification<TData>(string notificationName, Person recipient, TData data, RefListNotificationType? notificationType = null, GenericEntityReference sourceEntity = null, List<NotificationAttachmentDto> attachments = null, string cc = "") where TData : NotificationData;
    }
}
