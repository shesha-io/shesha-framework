using FluentMigrator;
using FluentMigrator.Expressions;
using System;

namespace Shesha.FluentMigrator.ReferenceLists
{
    /// <summary>
    /// ReferenceListItem create expression
    /// </summary>
    public class AddReferenceListItemExpression : SheshaMigrationExpressionBase
    {
        public AddReferenceListItemExpression(IQuerySchema querySchema, string @namespace, string name, ReferenceListItemDefinition item) : base(querySchema)
        {
            Namespace = @namespace;
            Name = name;
            Item = item;
        }

        public string Name { get; set; }
        public string Namespace { get; set; }
        public ReferenceListItemDefinition Item { get; set; }

        public override void ExecuteWith(IMigrationProcessor processor)
        {
            var exp = new PerformDBOperationExpression() { Operation = (connection, transaction) => 
                {
                    var helper = new ReferenceListDbHelper(connection, transaction, QuerySchema);
                    
                    var refListId = helper.GetReferenceListId(Namespace, Name);
                    if (refListId == null)
                        throw new Exception($"Reference list '{Namespace}.{Name}' not found");
                    helper.InsertReferenceListItem(refListId.Value, Item);
                } 
            };
            processor.Process(exp);
        }

    }
}
