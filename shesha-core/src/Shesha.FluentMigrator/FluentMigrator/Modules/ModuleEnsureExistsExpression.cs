using FluentMigrator;
using FluentMigrator.Expressions;
using Shesha.FluentMigrator.Modules;

namespace Shesha.FluentMigrator.ReferenceLists
{
    /// <summary>
    /// ReferenceList delete expression
    /// </summary>
    public class ModuleEnsureExistsExpression : SheshaMigrationExpressionBase
    {
        public ModuleEnsureExistsExpression(DbmsType dbmsType, IQuerySchema querySchema, string name) : base(dbmsType, querySchema)
        {
            Name = name;
        }

        public string Name { get; set; }

        public override void ExecuteWith(IMigrationProcessor processor)
        {
            var exp = new PerformDBOperationExpression() { Operation = (connection, transaction) => 
                {
                    var helper = new ModuleDbHelper(DbmsType, connection, transaction, QuerySchema);
                    helper.EnsureModuleExists(Name);
                } 
            };
            processor.Process(exp);
        }

    }
}
