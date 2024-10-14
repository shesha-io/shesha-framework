using FluentMigrator.Builders;
using FluentMigrator.Infrastructure;
using Shesha.FluentMigrator.Common;

namespace Shesha.FluentMigrator.Settings
{
    /// <summary>
    /// Add setting configuration expression builder
    /// </summary>
    public class AddSettingConfigurationExpressionBuilder : ExpressionBuilderBase<AddSettingConfigurationExpression>, IAddSettingConfigurationSyntax
    {
        private readonly IMigrationContext _context;

        public AddSettingConfigurationExpressionBuilder(AddSettingConfigurationExpression expression, IMigrationContext context) : base(expression)
        {
            _context = context;
        }

        /// inheritedDoc
        public IAddSettingConfigurationSyntax WithDescription(string description)
        {
            Expression.Description.Set(description);
            return this;
        }

        /// inheritedDoc
        public IAddSettingConfigurationSyntax IsClientSpecific()
        {
            Expression.IsClientSpecific.Set(true);
            return this;
        }

        /// inheritedDoc
        public IAddSettingConfigurationSyntax IsUserSpecific()
        {
            Expression.IsUserSpecific.Set(true);
            return this;
        }

        /// inheritedDoc
        public IAddSettingConfigurationSyntax WithEditForm(string module, string name)
        {
            Expression.EditForm.Set(new ConfigurationItemIdentifier(module, name));
            return this;
        }

        /// inheritedDoc
        public IAddSettingConfigurationSyntax WithAccessMode(SettingAccessMode accessMode)
        {
            Expression.AccessMode.Set(accessMode);
            return this;
        }

        /// inheritedDoc
        public IAddSettingConfigurationSyntax WithClientAccess (UserSettingAccessMode clientAccess)
        {
            Expression.ClientAccess.Set(clientAccess);
            return this;
        }

        /// inheritedDoc
        public IAddSettingConfigurationSyntax WithCategory(string category)
        {
            Expression.Category.Set(category);
            return this;
        }

        /// inheritedDoc
        public IAddSettingConfigurationSyntax OnModule(string moduleName)
        {
            Expression.Module.Set(moduleName);
            return this;
        }

        #region data types

        public IAddSettingConfigurationSyntax AsString(string? dataFormat = null)
        {
            Expression.DataType.Set(DataTypes.String);
            Expression.DataFormat.Set(dataFormat);
            return this;
        }

        public IAddSettingConfigurationSyntax AsBoolean()
        {
            Expression.DataType.Set(DataTypes.Boolean);
            Expression.DataFormat.Set(null);
            return this;
        }

        public IAddSettingConfigurationSyntax AsGuid()
        {
            Expression.DataType.Set(DataTypes.Guid);
            Expression.DataFormat.Set(null);
            return this;
        }

        public IAddSettingConfigurationSyntax AsInt64()
        {
            Expression.DataType.Set(DataTypes.Number);
            Expression.DataFormat.Set(NumberFormats.Int64);
            return this;
        }

        public IAddSettingConfigurationSyntax AsDouble()
        {
            Expression.DataType.Set(DataTypes.Number);
            Expression.DataFormat.Set(NumberFormats.Double);
            return this;
        }

        public IAddSettingConfigurationSyntax AsComplexObject(string className)
        {
            Expression.DataType.Set(DataTypes.Object);
            Expression.DataFormat.Set(className);
            return this;
        }

        public IAddSettingConfigurationSyntax AsDateTime()
        {
            Expression.DataType.Set(DataTypes.DateTime);
            Expression.DataFormat.Set(null);
            return this;
        }

        public IAddSettingConfigurationSyntax AsTime()
        {
            Expression.DataType.Set(DataTypes.Time);
            Expression.DataFormat.Set(null);
            return this;
        }

        public IAddSettingConfigurationSyntax AsReferenceList(string moduleName, string listName)
        {
            Expression.DataType.Set(DataTypes.ReferenceListItem);
            Expression.DataFormat.Set(null);
            Expression.ReferenceList.Set(new ConfigurationItemIdentifier(moduleName, listName));

            return this;
        }

        public IAddSettingConfigurationSyntax IfNotExists()
        {
            Expression.ApplyWhenMissing = true;
            return this;
        }
        #endregion
    }
}
