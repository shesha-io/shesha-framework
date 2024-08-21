using FluentMigrator;
using FluentMigrator.Expressions;
using System;

namespace Shesha.FluentMigrator.ReferenceLists
{
    /// <summary>
    /// ReferenceListItem update expression
    /// </summary>
    public class UpdateReferenceListItemExpression : SheshaMigrationExpressionBase
    {
        public UpdateReferenceListItemExpression(IQuerySchema querySchema, string @namespace, string name, Int64 itemValue) : base(querySchema)
        {
            Namespace = @namespace;
            Name = name;
            ItemValue = itemValue;
        }

        public string Name { get; set; }
        public string Namespace { get; set; }
        public Int64 ItemValue { get; set; }

        public PropertyUpdateDefinition<string> ItemText { get; set; } = new PropertyUpdateDefinition<string>();
        public PropertyUpdateDefinition<string> Description { get; set; } = new PropertyUpdateDefinition<string>();
        public PropertyUpdateDefinition<Int64> OrderIndex { get; set; } = new PropertyUpdateDefinition<Int64>();

        public override void ExecuteWith(IMigrationProcessor processor)
        {
            var exp = new PerformDBOperationExpression() { Operation = (connection, transaction) => 
                {
                    var helper = new ReferenceListDbHelper(connection, transaction, QuerySchema);
                    var listId = helper.GetReferenceListId(Namespace, Name);
                    if (listId == null)
                        throw new Exception($"ReferenceList '{Namespace}.{Name}' not found");

                    var itemId = helper.GetReferenceListItemId(listId.Value, ItemValue);
                    if (itemId == null)
                        throw new Exception($"Item {ItemValue} not found in the ReferenceList '{Namespace}.{Name}'");

                    if (ItemText.IsSet)
                        helper.UpdateReferenceListItemText(itemId, ItemText.Value);
                    if (Description.IsSet)
                        helper.UpdateReferenceListItemDescription(itemId, Description.Value);
                    if (OrderIndex.IsSet)
                        helper.UpdateReferenceListItemOrderIndex(itemId, OrderIndex.Value);
                } 
            };
            processor.Process(exp);
        }
    }
}
