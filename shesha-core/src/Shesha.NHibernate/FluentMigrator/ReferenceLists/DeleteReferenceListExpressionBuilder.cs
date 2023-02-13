using FluentMigrator.Builders;
using FluentMigrator.Infrastructure;

namespace Shesha.FluentMigrator.ReferenceLists
{
    public class DeleteReferenceListExpressionBuilder : ExpressionBuilderBase<DeleteReferenceListExpression>, IDeleteReferenceListSyntax
    {
        private readonly IMigrationContext _context;

        public DeleteReferenceListExpressionBuilder(DeleteReferenceListExpression expression, IMigrationContext context) : base(expression)
        {
            _context = context;
        }
    }
}
