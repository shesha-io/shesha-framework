using Shesha.Domain.Enums;
using System;

namespace Shesha.FluentMigrator.Notifications
{
    public class NotificationTemplateDefinition
    {
        public PropertyUpdateDefinition<Guid> Id { get; set; }
        public PropertyUpdateDefinition<bool> IsEnabled { get; set; }
        public PropertyUpdateDefinition<string> Name { get; set; }
        public PropertyUpdateDefinition<string> Body { get; set; }
        public PropertyUpdateDefinition<string> Subject { get; set; }
        public PropertyUpdateDefinition<RefListNotificationType> SendType { get; set; }
        public PropertyUpdateDefinition<RefListNotificationTemplateType> BodyFormat { get; set; }

        public NotificationTemplateDefinition()
        {
            Id = new PropertyUpdateDefinition<Guid>();
            IsEnabled = new PropertyUpdateDefinition<bool>();
            Name = new PropertyUpdateDefinition<string>();
            Body = new PropertyUpdateDefinition<string>();
            Subject = new PropertyUpdateDefinition<string>();
            SendType = new PropertyUpdateDefinition<RefListNotificationType>();
            BodyFormat = new PropertyUpdateDefinition<RefListNotificationTemplateType>();
    }
    }
}
