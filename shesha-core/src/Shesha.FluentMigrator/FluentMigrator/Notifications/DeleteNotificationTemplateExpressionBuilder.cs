using FluentMigrator.Builders;
using FluentMigrator.Infrastructure;

namespace Shesha.FluentMigrator.Notifications
{
    public class DeleteNotificationTemplateExpressionBuilder : ExpressionBuilderBase<DeleteNotificationTemplateExpression>, IDeleteNotificationTemplateSyntax
    {
        private readonly IMigrationContext _context;

        public DeleteNotificationTemplateExpressionBuilder(DeleteNotificationTemplateExpression expression, IMigrationContext context) : base(expression)
        {
            _context = context;
        }
    }
}
