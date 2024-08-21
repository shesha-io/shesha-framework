using FluentMigrator;
using FluentMigrator.Expressions;

namespace Shesha.FluentMigrator.ReferenceLists
{
    /// <summary>
    /// ReferenceList delete expression
    /// </summary>
    public class DeleteReferenceListExpression : SheshaMigrationExpressionBase
    {
        public DeleteReferenceListExpression(IQuerySchema querySchema, string @namespace, string name) : base(querySchema)
        {
            Namespace = @namespace;
            Name = name;
        }

        public string Name { get; set; }
        public string Namespace { get; set; }

        public override void ExecuteWith(IMigrationProcessor processor)
        {
            var exp = new PerformDBOperationExpression() { Operation = (connection, transaction) => 
                {
                    var helper = new ReferenceListDbHelper(connection, transaction, QuerySchema);
                    helper.DeleteReferenceListItems(Namespace, Name);
                    helper.DeleteReferenceList(Namespace, Name);
                } 
            };
            processor.Process(exp);
        }

    }
}
