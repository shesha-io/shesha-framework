using FluentMigrator;
using FluentMigrator.Infrastructure;

namespace Shesha.FluentMigrator.Notifications
{
    /// <summary>
    /// Add notification expression builder
    /// </summary>
    public class AddNotificationExpressionBuilder : NotificationTemplateExpressionBuilderBase<AddNotificationExpression, IAddNotificationSyntax>, IAddNotificationSyntax
    {
        public AddNotificationExpressionBuilder(DbmsType dbmsType, IQuerySchema querySchema, AddNotificationExpression expression, IMigrationContext context) : base(dbmsType, querySchema, expression, context)
        {
        }

        /// <summary>
        /// Set notification description
        /// </summary>
        /// <param name="description"></param>
        /// <returns></returns>
        public IAddNotificationSyntax SetDescription(string description)
        {
            Expression.Description = description;
            return this;
        }
    }
}
