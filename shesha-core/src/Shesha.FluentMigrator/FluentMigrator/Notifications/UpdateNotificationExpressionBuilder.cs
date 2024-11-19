using FluentMigrator;
using FluentMigrator.Infrastructure;

namespace Shesha.FluentMigrator.Notifications
{
    public class UpdateNotificationExpressionBuilder : NotificationTemplateExpressionBuilderBase<UpdateNotificationExpression, IUpdateNotificationSyntax>, IUpdateNotificationSyntax
    {
        public UpdateNotificationExpressionBuilder(DbmsType dbmsType, IQuerySchema querySchema, UpdateNotificationExpression expression, IMigrationContext context) : base(dbmsType, querySchema, expression, context)
        {
        }

        public IUpdateNotificationSyntax DeleteTemplates()
        {
            _context.Expressions.Add(new DeleteNotificationTemplateExpression(_dbmsType, _querySchema)
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
