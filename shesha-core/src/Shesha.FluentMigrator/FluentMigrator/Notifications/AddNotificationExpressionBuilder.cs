using FluentMigrator.Builders;
using FluentMigrator.Infrastructure;
using System;

namespace Shesha.FluentMigrator.Notifications
{
    /// <summary>
    /// Add notification expression builder
    /// </summary>
    public class AddNotificationExpressionBuilder : NotificationTemplateExpressionBuilderBase<AddNotificationExpression, IAddNotificationSyntax>, IAddNotificationSyntax
    {
        public AddNotificationExpressionBuilder(AddNotificationExpression expression, IMigrationContext context) : base(expression, context)
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
