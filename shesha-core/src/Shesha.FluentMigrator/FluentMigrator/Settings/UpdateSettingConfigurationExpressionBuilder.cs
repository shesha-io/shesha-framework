using FluentMigrator.Builders;
using FluentMigrator.Infrastructure;

namespace Shesha.FluentMigrator.Settings
{
    /// <summary>
    /// Add setting configuration expression builder
    /// </summary>
    public class UpdateSettingConfigurationExpressionBuilder : ExpressionBuilderBase<UpdateSettingConfigurationExpression>, IUpdateSettingConfigurationSyntax
    {
        private readonly IMigrationContext _context;

        public UpdateSettingConfigurationExpressionBuilder(UpdateSettingConfigurationExpression expression, IMigrationContext context) : base(expression)
        {
            _context = context;
        }

        /// inheritedDoc
        public IUpdateSettingConfigurationSyntax SetDescription(string description)
        {
            Expression.Description.Set(description);
            return this;
        }

        /// inheritedDoc
        public IUpdateSettingConfigurationSyntax SetIsClientSpecific(bool value)
        {
            Expression.IsClientSpecific.Set(value);
            return this;
        }

        /// inheritedDoc
        public IUpdateSettingConfigurationSyntax SetEditForm(string module, string name)
        {
            Expression.EditForm.Set(new ConfigurationItemIdentifier(module, name));
            return this;
        }

        /// inheritedDoc
        public IUpdateSettingConfigurationSyntax SetAccessMode(SettingAccessMode accessMode)
        {
            Expression.AccessMode.Set(accessMode);
            return this;
        }

        /// inheritedDoc
        public IUpdateSettingConfigurationSyntax SetCategory(string category)
        {
            Expression.Category.Set(category);
            return this;
        }

        /// inheritedDoc
        public IUpdateSettingConfigurationSyntax SetDisplayName(string displayName)
        {
            Expression.DisplayName.Set(displayName);
            return this;
        }

        /// inheritedDoc
        public void SetValue(string value)
        {
            Expression.Value.Set(value);
        }

        /// inheritedDoc
        public void ResetValueToDefault()
        {
            Expression.Value.Set(null);
        }

        /// inheritedDoc
        public void SetValueForApplication(string appKey, string value)
        {
            Expression.Value.Set(value);
            Expression.ValueAppKey.Set(appKey);
        }

        public IUpdateSettingConfigurationSyntax OnModule(string moduleName)
        {
            Expression.Module.Set(moduleName);
            return this;
        }
    }
}
