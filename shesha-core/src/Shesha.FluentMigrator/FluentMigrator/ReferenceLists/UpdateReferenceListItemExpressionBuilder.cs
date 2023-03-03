using FluentMigrator.Builders;
using FluentMigrator.Infrastructure;

namespace Shesha.FluentMigrator.ReferenceLists
{
    /// <summary>
    /// ReferenceListItem update expression
    /// </summary>
    public class UpdateReferenceListItemExpressionBuilder : ExpressionBuilderBase<UpdateReferenceListItemExpression>, IUpdateReferenceListItemSyntax
    {
        private readonly IMigrationContext _context;

        public UpdateReferenceListItemExpressionBuilder(UpdateReferenceListItemExpression expression, IMigrationContext context) : base(expression)
        {
            _context = context;
        }

        public IUpdateReferenceListItemSyntax SetDescription(string description)
        {
            Expression.Description.Set(description);
            return this;
        }

        public IUpdateReferenceListItemSyntax SetItemText(string itemText)
        {
            Expression.ItemText.Set(itemText);
            return this;
        }

        public IUpdateReferenceListItemSyntax SetOrderIndex(long orderIndex)
        {
            Expression.OrderIndex.Set(orderIndex);
            return this;
        }
    }
}
