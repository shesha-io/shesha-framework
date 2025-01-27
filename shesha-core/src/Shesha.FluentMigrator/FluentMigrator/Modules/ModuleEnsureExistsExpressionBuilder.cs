using FluentMigrator.Builders;
using FluentMigrator.Infrastructure;

namespace Shesha.FluentMigrator.ReferenceLists
{
    public class ModuleEnsureExistsExpressionBuilder : ExpressionBuilderBase<ModuleEnsureExistsExpression>, IModuleEnsureExistsExpressionSyntax
    {
        private readonly IMigrationContext _context;

        public ModuleEnsureExistsExpressionBuilder(ModuleEnsureExistsExpression expression, IMigrationContext context) : base(expression)
        {
            _context = context;
        }
    }
}
