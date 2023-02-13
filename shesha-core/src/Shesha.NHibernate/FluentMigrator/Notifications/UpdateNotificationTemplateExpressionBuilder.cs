using FluentMigrator.Builders;
using FluentMigrator.Infrastructure;
using Shesha.Domain.Enums;

namespace Shesha.FluentMigrator.Notifications
{
    /// <summary>
    /// NotificationTemplate update expression
    /// </summary>
    public class UpdateNotificationTemplateExpressionBuilder : ExpressionBuilderBase<UpdateNotificationTemplateExpression>, IUpdateNotificationTemplateSyntax
    {
        private readonly IMigrationContext _context;

        public UpdateNotificationTemplateExpressionBuilder(UpdateNotificationTemplateExpression expression, IMigrationContext context) : base(expression)
        {
            _context = context;
        }

        public IUpdateNotificationTemplateSyntax SetName(string name)
        {
            Expression.Template.Name.Set(name);
            return this;
        }

        public IUpdateNotificationTemplateSyntax SetSubject(string subject)
        {
            Expression.Template.Subject.Set(subject);
            return this;
        }

        public IUpdateNotificationTemplateSyntax SetBody(string body)
        {
            Expression.Template.Body.Set(body);
            return this;
        }

        public IUpdateNotificationTemplateSyntax SetBodyFormat(RefListNotificationTemplateType bodyFormat)
        {
            Expression.Template.BodyFormat.Set(bodyFormat);
            return this;
        }

        public IUpdateNotificationTemplateSyntax SetSendType(RefListNotificationType sendType)
        {
            Expression.Template.SendType.Set(sendType);
            return this;
        }

        public IUpdateNotificationTemplateSyntax Disable()
        {
            Expression.Template.IsEnabled.Set(false);
            return this;
        }

        public IUpdateNotificationTemplateSyntax Enable()
        {
            Expression.Template.IsEnabled.Set(true);
            return this;
        }
    }
}
