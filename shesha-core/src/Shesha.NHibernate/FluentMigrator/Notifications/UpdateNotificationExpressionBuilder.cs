using FluentMigrator.Builders;
using FluentMigrator.Infrastructure;
using System;

namespace Shesha.FluentMigrator.Notifications
{
    public class UpdateNotificationExpressionBuilder : NotificationTemplateExpressionBuilderBase<UpdateNotificationExpression, IUpdateNotificationSyntax>, IUpdateNotificationSyntax
    {
        public UpdateNotificationExpressionBuilder(UpdateNotificationExpression expression, IMigrationContext context) : base(expression, context)
        {
        }

        public IUpdateNotificationSyntax DeleteTemplates()
        {
            _context.Expressions.Add(new DeleteNotificationTemplateExpression
            {
                Namespace = Expression.Namespace,
                Name = Expression.Name,
                DeleteAll = true
            });

            return this;
        }

        public IUpdateNotificationSyntax SetDescription(string description) 
        {
            Expression.Description.Set(description);
            
            return this;
        }
    }
}
