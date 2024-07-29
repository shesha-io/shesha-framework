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
        public PropertyUpdateDefinition<bool> IsUserSpecific { get; set; } = new PropertyUpdateDefinition<bool>();
        public PropertyUpdateDefinition<UserSettingAccessMode> ClientAccess { get; set; } = new PropertyUpdateDefinition<UserSettingAccessMode>();
        public PropertyUpdateDefinition<ConfigurationItemIdentifier> EditForm { get; set; } = new PropertyUpdateDefinition<ConfigurationItemIdentifier>();
        public PropertyUpdateDefinition<string> DataType { get; set; } = new PropertyUpdateDefinition<string>();
        public PropertyUpdateDefinition<string?> DataFormat { get; set; } = new PropertyUpdateDefinition<string?>();
        public PropertyUpdateDefinition<ConfigurationItemIdentifier> ReferenceList { get; set; } = new PropertyUpdateDefinition<ConfigurationItemIdentifier>();
        public PropertyUpdateDefinition<string> DisplayName { get; set; } = new PropertyUpdateDefinition<string>();

        public PropertyUpdateDefinition<string?> Value { get; set; } = new PropertyUpdateDefinition<string?>();
        public PropertyUpdateDefinition<string?> ValueAppKey { get; set; } = new PropertyUpdateDefinition<string?>();
        public PropertyUpdateDefinition<long?> ValueUserId { get; set; } = new PropertyUpdateDefinition<long?>();

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
                    if (IsUserSpecific.IsSet)
                        helper.UpdateIsUserSpecific(id.Value, IsUserSpecific.Value);
                    if (ClientAccess.IsSet)
                        helper.UpdateClientAccess(id.Value, ClientAccess.Value);
                    if (EditForm.IsSet)
                        helper.UpdateEditForm(id.Value, EditForm.Value);
                    if (ReferenceList.IsSet)
                        helper.UpdateReferenceList(id.Value, ReferenceList.Value);
                    if (DisplayName.IsSet)
                        helper.UpdateDisplayName(id.Value, DisplayName.Value);

                    // update value
                    if (Value.IsSet)
                    {
                        if (ValueAppKey.IsSet && !string.IsNullOrEmpty(ValueAppKey.Value) )
                        {
                            var appId = helper.GetFrontEndAppId(ValueAppKey.Value);
                            if (appId == null)
                                throw new SheshaMigrationException($"Front-end application with appKey = `{ValueAppKey.Value}` not found");

                            helper.UpdateSettingValue(id.Value, appId, null, Value.Value);
                        } else
                            helper.UpdateSettingValue(id.Value, null, null, Value.Value);

                        if (ValueUserId.IsSet && (ValueUserId.Value) is not null)
                        {
                            helper.UpdateSettingValue(id.Value, null, ValueUserId.Value, Value.Value);
                        }
                    }
                }
            };
            processor.Process(exp);
        }
    }
}
