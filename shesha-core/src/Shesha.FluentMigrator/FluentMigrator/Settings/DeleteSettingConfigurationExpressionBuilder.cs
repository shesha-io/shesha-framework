using FluentMigrator.Builders;
using FluentMigrator.Infrastructure;

namespace Shesha.FluentMigrator.Settings
{
    /// <summary>
    /// Delete setting configuration expression builder
    /// </summary>
    public class DeleteSettingConfigurationExpressionBuilder : ExpressionBuilderBase<DeleteSettingConfigurationExpression>, IDeleteSettingConfigurationSyntax
    {
        private readonly IMigrationContext _context;

        public DeleteSettingConfigurationExpressionBuilder(DeleteSettingConfigurationExpression expression, IMigrationContext context) : base(expression)
        {
            _context = context;
        }

        /// inheritedDoc
        public IDeleteSettingConfigurationSyntax FromModule(string module)
        {
            Expression.Module.Set(module);
            return this;
        }
    }
}
