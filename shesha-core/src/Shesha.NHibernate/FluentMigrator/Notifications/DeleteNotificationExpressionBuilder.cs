using FluentMigrator.Builders;
using FluentMigrator.Infrastructure;

namespace Shesha.FluentMigrator.Notifications
{
    public class DeleteNotificationExpressionBuilder : ExpressionBuilderBase<DeleteNotificationExpression>, IDeleteNotificationSyntax
    {
        private readonly IMigrationContext _context;

        public DeleteNotificationExpressionBuilder(DeleteNotificationExpression expression, IMigrationContext context) : base(expression)
        {
            _context = context;
        }
    }
}
