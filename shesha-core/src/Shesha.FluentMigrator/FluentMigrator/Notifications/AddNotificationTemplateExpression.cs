﻿using FluentMigrator;
using FluentMigrator.Expressions;
using System;

namespace Shesha.FluentMigrator.Notifications
{
    /// <summary>
    /// NotificationTemplate create expression
    /// </summary>
    public class AddNotificationTemplateExpression : SheshaMigrationExpressionBase
    {
        public string Name { get; private set; }
        public string Namespace { get; private set; }
        public NotificationTemplateDefinition Template { get; set; } = new NotificationTemplateDefinition();

        public override void ExecuteWith(IMigrationProcessor processor)
        {
            var exp = new PerformDBOperationExpression() { Operation = (connection, transaction) => 
                {
                    var helper = new NotificationDbHelper(DbmsType, connection, transaction, QuerySchema);
                    
                    var notificationId = helper.GetNotificationId(Namespace, Name);
                    if (notificationId == null)
                        throw new Exception($"Notification '{Namespace}.{Name}' not found");

                    if (!Template.Id.IsSet)
                        Template.Id.Set(Guid.NewGuid());
                    var templateId = Template.Id.Value;

                    helper.InsertNotificationTemplate(notificationId.Value, Template);

                    if (Template.Name.IsSet)
                        helper.UpdateTemplateName(templateId, Template.Name.Value);
                    if (Template.Subject.IsSet)
                        helper.UpdateTemplateSubject(templateId, Template.Subject.Value);
                    if (Template.Body.IsSet)
                        helper.UpdateTemplateBody(templateId, Template.Body.Value);
                    if (Template.BodyFormat.IsSet)
                        helper.UpdateTemplateBodyFormat(templateId, Template.BodyFormat.Value);
                    if (Template.SendType.IsSet)
                        helper.UpdateTemplateSendType(templateId, Template.SendType.Value);
                    if (Template.IsEnabled.IsSet)
                        helper.UpdateTemplateIsEnabled(templateId, Template.IsEnabled.Value);
                }
            };
            processor.Process(exp);
        }

        public AddNotificationTemplateExpression(DbmsType dbmsType, IQuerySchema querySchema, string @namespace, string name): base(dbmsType, querySchema)
        {
            Namespace = @namespace;
            Name = name;
        }
    }
}
