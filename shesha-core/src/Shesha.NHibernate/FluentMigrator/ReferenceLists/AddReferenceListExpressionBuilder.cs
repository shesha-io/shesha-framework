using FluentMigrator.Builders;
using FluentMigrator.Infrastructure;
using System;

namespace Shesha.FluentMigrator.ReferenceLists
{
    public class AddReferenceListExpressionBuilder : ExpressionBuilderBase<AddReferenceListExpression>, IAddReferenceListSyntax
    {
        private readonly IMigrationContext _context;

        public AddReferenceListExpressionBuilder(AddReferenceListExpression expression, IMigrationContext context) : base(expression)
        {
            _context = context;
        }

        public IAddReferenceListSyntax AddItem(long value, string item, Int64? orderIndex = null, string description = null)
        {
            var listItem = new ReferenceListItemDefinition { 
                Item = item, 
                ItemValue = value,
                OrderIndex = orderIndex,
                Description = description
            };
            var addRefListItem = new AddReferenceListItemExpression(_context.QuerySchema)
            {
                Item = listItem,
                Namespace = Expression.Namespace,
                Name = Expression.Name
            };

            _context.Expressions.Add(addRefListItem);
            
            return this;
        }

        public IAddReferenceListSyntax SetDescription(string description)
        {
            Expression.Description = description;
            return this;
        }

        public IAddReferenceListSyntax SetNoSelectionValue(long? value)
        {
            Expression.NoSelectionValue.Set(value);
            return this;
        }
    }
}
