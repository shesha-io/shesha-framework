using FluentMigrator;
using FluentMigrator.Expressions;
using System;

namespace Shesha.FluentMigrator.ReferenceLists
{
    /// <summary>
    /// ReferenceList fluent interface
    /// </summary>
    public class AddReferenceListExpression : SheshaMigrationExpressionBase
    {
        public AddReferenceListExpression(IQuerySchema querySchema, string @namespace, string name) : base(querySchema)
        {
            Namespace = @namespace;
            Name = name;
        }

        public string Name { get; set; }
        public string Namespace { get; set; }
        public string? Description { get; set; }
        public PropertyUpdateDefinition<Int64?> NoSelectionValue { get; set; } = new PropertyUpdateDefinition<Int64?>();

        public override void ExecuteWith(IMigrationProcessor processor)
        {
            var exp = new PerformDBOperationExpression() { Operation = (connection, transaction) => {
                var helper = new ReferenceListDbHelper(connection, transaction, QuerySchema);
                var refListId = helper.InsertReferenceList(Namespace, Name, Description);

                if (NoSelectionValue.IsSet)
                    helper.UpdateReferenceListNoSelectionValue(refListId, NoSelectionValue.Value);
            }
            };
            processor.Process(exp);
        }
    }
}
