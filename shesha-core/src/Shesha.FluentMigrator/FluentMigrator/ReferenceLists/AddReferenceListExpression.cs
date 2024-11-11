using FluentMigrator;
using FluentMigrator.Expressions;

namespace Shesha.FluentMigrator.ReferenceLists
{
    /// <summary>
    /// ReferenceList fluent interface
    /// </summary>
    public class AddReferenceListExpression : SheshaMigrationExpressionBase
    {
        public AddReferenceListExpression(DbmsType dbmsType, IQuerySchema querySchema, string @namespace, string name) : base(dbmsType, querySchema)
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
                var helper = new ReferenceListDbHelper(DbmsType, connection, transaction, QuerySchema);
                var refListId = helper.InsertReferenceList(Namespace, Name, Description);

                if (NoSelectionValue.IsSet)
                    helper.UpdateReferenceListNoSelectionValue(refListId, NoSelectionValue.Value);
            }
            };
            processor.Process(exp);
        }
    }
}
