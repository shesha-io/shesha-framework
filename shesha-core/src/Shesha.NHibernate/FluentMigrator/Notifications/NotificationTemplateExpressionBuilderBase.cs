using FluentMigrator.Builders;
using FluentMigrator.Expressions;
using FluentMigrator.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.FluentMigrator.Notifications
{
    public class NotificationTemplateExpressionBuilderBase<TExpr, TNext>: ExpressionBuilderBase<TExpr> where TExpr: NotificationExpressionBase where TNext: class
    {
        protected readonly IMigrationContext _context;

        public NotificationTemplateExpressionBuilderBase(TExpr expression, IMigrationContext context) : base(expression)
        {
            _context = context;
        }

        public TNext AddEmailTemplate(Guid id, string name, string subject, string body)
        {
            var template = new NotificationTemplateDefinition();
            template.Id.Set(id);
            template.Name.Set(name);
            template.Subject.Set(subject);
            template.Body.Set(body);

            template.IsEnabled.Set(true);
            template.SendType.Set(Domain.Enums.RefListNotificationType.Email);
            template.BodyFormat.Set(Domain.Enums.RefListNotificationTemplateType.Html);

            _context.Expressions.Add(new AddNotificationTemplateExpression
            {
                Template = template,
                Namespace = Expression.Namespace,
                Name = Expression.Name
            });

            return this as TNext;
        }

        public TNext AddPushTemplate(Guid id, string name, string subject, string body)
        {
            var template = new NotificationTemplateDefinition();
            template.Id.Set(id);
            template.Name.Set(name);
            template.Subject.Set(subject);
            template.Body.Set(body);

            template.IsEnabled.Set(true);
            template.SendType.Set(Domain.Enums.RefListNotificationType.Push);
            template.BodyFormat.Set(Domain.Enums.RefListNotificationTemplateType.PlainText);

            _context.Expressions.Add(new AddNotificationTemplateExpression
            {
                Template = template,
                Namespace = Expression.Namespace,
                Name = Expression.Name
            });

            return this as TNext;
        }

        public TNext AddSmsTemplate(Guid id, string name, string body)
        {
            var template = new NotificationTemplateDefinition();
            template.Id.Set(id);
            template.Name.Set(name);
            template.Body.Set(body);

            template.IsEnabled.Set(true);
            template.SendType.Set(Domain.Enums.RefListNotificationType.SMS);
            template.BodyFormat.Set(Domain.Enums.RefListNotificationTemplateType.PlainText);

            _context.Expressions.Add(new AddNotificationTemplateExpression
            {
                Template = template,
                Namespace = Expression.Namespace,
                Name = Expression.Name
            });

            return this as TNext;
        }

    }
}
