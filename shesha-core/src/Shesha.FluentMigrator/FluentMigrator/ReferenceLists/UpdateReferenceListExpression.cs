using FluentMigrator;
using FluentMigrator.Expressions;
using System;

namespace Shesha.FluentMigrator.ReferenceLists
{
    /// <summary>
    /// ReferenceList update expression
    /// </summary>
    public class UpdateReferenceListExpression : SheshaMigrationExpressionBase
    {
        public UpdateReferenceListExpression(IQuerySchema querySchema, string @namespace, string name) : base(querySchema)
        {
            Namespace = @namespace;
            Name = name;
        }

        public string Name { get; set; }
        public string Namespace { get; set; }
        public PropertyUpdateDefinition<string> Description { get; set; } = new PropertyUpdateDefinition<string>();
        public PropertyUpdateDefinition<Int64?> NoSelectionValue { get; set; } = new PropertyUpdateDefinition<Int64?>();

        public override void ExecuteWith(IMigrationProcessor processor)
        {
            var exp = new PerformDBOperationExpression() { Operation = (connection, transaction) => 
                {
                    var helper = new ReferenceListDbHelper(connection, transaction, QuerySchema);
                    var id = helper.GetReferenceListId(Namespace, Name);
                    if (id == null)
                        return;

                    if (Description.IsSet)
                        helper.UpdateReferenceListDescription(id, Description.Value);
                    if (NoSelectionValue.IsSet)
                        helper.UpdateReferenceListNoSelectionValue(id, NoSelectionValue.Value);
                } 
            };
            processor.Process(exp);
        }
    }
}
