using FluentMigrator;
using FluentMigrator.Expressions;

namespace Shesha.FluentMigrator.Settings
{
    /// <summary>
    /// Add setting configuration expression
    /// </summary>
    public class UpdateSettingConfigurationExpression : MigrationExpressionBase
    {
        private readonly string _migrationModule;

        public UpdateSettingConfigurationExpression(string migrationModule, string name)
        {
            _migrationModule = migrationModule;
            Name = name;
        }

        /// <summary>
        /// Setting name
        /// </summary>
        public string Name { get; set; }

        public PropertyUpdateDefinition<string> Module { get; set; } = new PropertyUpdateDefinition<string>();
        public PropertyUpdateDefinition<string> Description { get; set; } = new PropertyUpdateDefinition<string>();
        public PropertyUpdateDefinition<string> Category { get; set; } = new PropertyUpdateDefinition<string>();
        public PropertyUpdateDefinition<bool> IsClientSpecific { get; set; } = new PropertyUpdateDefinition<bool>();
        public PropertyUpdateDefinition<SettingAccessMode> AccessMode { get; set; } = new PropertyUpdateDefinition<SettingAccessMode>();
        public PropertyUpdateDefinition<ConfigurationItemIdentifier> EditForm { get; set; } = new PropertyUpdateDefinition<ConfigurationItemIdentifier>();
        public PropertyUpdateDefinition<string> DataType { get; set; } = new PropertyUpdateDefinition<string>();
        public PropertyUpdateDefinition<string?> DataFormat { get; set; } = new PropertyUpdateDefinition<string?>();
        public PropertyUpdateDefinition<ConfigurationItemIdentifier> ReferenceList { get; set; } = new PropertyUpdateDefinition<ConfigurationItemIdentifier>();
        public PropertyUpdateDefinition<string> DisplayName { get; set; } = new PropertyUpdateDefinition<string>();

        public override void ExecuteWith(IMigrationProcessor processor)
        {
            var exp = new PerformDBOperationExpression()
            {
                Operation = (connection, transaction) => {
                    var helper = new SettingsDbHelper(connection, transaction);

                    var module = Module.IsSet ? Module.Value : _migrationModule;
                    var id = helper.GetSettingId(module, Name);
                    if (id == null)
                        throw new SheshaMigrationException($"Settings with name `{Name}` not found in module `{module}`");

                    if (Description.IsSet)
                        helper.UpdateSettingDescription(id.Value, Description.Value);
                    if (Category.IsSet)
                        helper.UpdateCategory(id.Value, Category.Value);
                    if (IsClientSpecific.IsSet)
                        helper.UpdateIsClientSpecific(id.Value, IsClientSpecific.Value);
                    if (AccessMode.IsSet)
                        helper.UpdateAccessMode(id.Value, AccessMode.Value);
                    if (EditForm.IsSet)
                        helper.UpdateEditForm(id.Value, EditForm.Value);
                    if (ReferenceList.IsSet)
                        helper.UpdateReferenceList(id.Value, ReferenceList.Value);
                    if (DisplayName.IsSet)
                        helper.UpdateDisplayName(id.Value, DisplayName.Value);                    
                }
            };
            processor.Process(exp);
        }
    }
}
