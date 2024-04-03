using FluentMigrator.Builders;
using FluentMigrator.Infrastructure;

namespace Shesha.FluentMigrator.ReferenceLists
{
    public class UpdateReferenceListExpressionBuilder : ExpressionBuilderBase<UpdateReferenceListExpression>, IUpdateReferenceListSyntax
    {
        private readonly IMigrationContext _context;

        public UpdateReferenceListExpressionBuilder(UpdateReferenceListExpression expression, IMigrationContext context) : base(expression)
        {
            _context = context;
        }

        public IUpdateReferenceListSyntax AddItem(long value, string item, Int64? orderIndex = null, string? description = null)
        {
            var listItem = new ReferenceListItemDefinition(value, item)
            {
                OrderIndex = orderIndex,
                Description = description
            };
            var addRefListItem = new AddReferenceListItemExpression(_context.QuerySchema, Expression.Namespace, Expression.Name, listItem);

            _context.Expressions.Add(addRefListItem);

            return this;
        }

        public IUpdateReferenceListSyntax DeleteItem(Int64 itemValue) 
        {
            _context.Expressions.Add(new DeleteReferenceListItemExpression(_context.QuerySchema, Expression.Namespace, Expression.Name)
            {
                ItemValue = itemValue
            });

            return this;
        }        

        public IUpdateReferenceListSyntax DeleteAllItems()
        {
            _context.Expressions.Add(new DeleteReferenceListItemExpression(_context.QuerySchema, Expression.Namespace, Expression.Name)
            {
                DeleteAll = true
            });

            return this;
        }

        public IUpdateReferenceListSyntax SetDescription(string description) 
        {
            Expression.Description.Set(description);
            
            return this;
        }

        public IUpdateReferenceListSyntax SetNoSelectionValue(Int64? value)
        {
            Expression.NoSelectionValue.Set(value);

            return this;
        }

        public IUpdateReferenceListSyntax UpdateItem(long itemValue, Action<IUpdateReferenceListItemSyntax> updateAction)
        {
            var updateRefListItem = new UpdateReferenceListItemExpression(_context.QuerySchema, Expression.Namespace, Expression.Name, itemValue);

            var builder = new UpdateReferenceListItemExpressionBuilder(updateRefListItem, _context);
            updateAction.Invoke(builder);

            _context.Expressions.Add(updateRefListItem);

            return this;
        }
    }
}
