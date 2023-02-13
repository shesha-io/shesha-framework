using FluentMigrator.Builders;
using FluentMigrator.Infrastructure;

namespace Shesha.FluentMigrator.Notifications
{
    public class AddNotificationTemplateExpressionBuilder : ExpressionBuilderBase<AddNotificationTemplateExpression>, IAddNotificationTemplateSyntax
    {
        private readonly IMigrationContext _context;

        public AddNotificationTemplateExpressionBuilder(AddNotificationTemplateExpression expression, IMigrationContext context) : base(expression)
        {
            _context = context;
        }

        public IAddNotificationTemplateSyntax Disable()
        {
            Expression.Template.IsEnabled.Set(false);
            return this;
        }

        public IAddNotificationTemplateSyntax Enable()
        {
            Expression.Template.IsEnabled.Set(true);
            return this;
        }
    }
}
