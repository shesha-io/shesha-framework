using FluentMigrator;
using FluentMigrator.Expressions;

namespace Shesha.FluentMigrator.Settings
{
    /// <summary>
    /// Add setting configuration expression
    /// </summary>
    public class AddSettingConfigurationExpression : SheshaMigrationExpressionBase
    {
        private readonly string _migrationModule;

        public AddSettingConfigurationExpression(DbmsType dbmsType, IQuerySchema querySchema, string migrationModule, string name, string displayName) : base(dbmsType, querySchema)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentNullException($"`{nameof(name)}` is mandatory", nameof(name));

            _migrationModule = migrationModule;
            Name = name;
            DisplayName = displayName;
        }

        /// <summary>
        /// Setting name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Settings Display Name
        /// </summary>
        public string DisplayName { get; set; }

        /// <summary>
        /// If true, indicates that expression should be applied only when setting is missing in the DB
        /// </summary>
        public bool ApplyWhenMissing { get; set; }
        
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

        public override void ExecuteWith(IMigrationProcessor processor)
        {
            var exp = new PerformDBOperationExpression()
            {
                Operation = (connection, transaction) => {
                    var helper = new SettingsDbHelper(DbmsType, connection, transaction);

                    var dataType = DataType.IsSet
                        ? DataType.Value
                        : null;
                    if (string.IsNullOrWhiteSpace(dataType))
                        throw new SheshaMigrationException($"DataType must be specified for setting `{Name}`");

                    var dataFormat = DataFormat.Value;

                    var module = Module.IsSet ? Module.Value : _migrationModule;
                    if (string.IsNullOrWhiteSpace(module))
                        throw new SheshaMigrationException($"Module must be specified for setting `{Name}`");

                    var existingId = helper.GetSettingId(module, Name);
                    if (existingId != null) 
                    {
                        if (ApplyWhenMissing)
                            return;
                        else
                            throw new SheshaMigrationException($"Setting `{Name}` already exists in module `{module}`");
                    }

                    var id = helper.InsertSettingConfiguration(module, Name, DisplayName, dataType, dataFormat);

                    if (Description.IsSet)
                        helper.UpdateSettingDescription(id, Description.Value);
                    if (Category.IsSet)
                        helper.UpdateCategory(id, Category.Value);
                    if (IsClientSpecific.IsSet)
                        helper.UpdateIsClientSpecific(id, IsClientSpecific.Value);
                    if (AccessMode.IsSet)
                        helper.UpdateAccessMode(id, AccessMode.Value);
                    if (EditForm.IsSet)
                        helper.UpdateEditForm(id, EditForm.Value);
                    if (ReferenceList.IsSet)
                        helper.UpdateReferenceList(id, ReferenceList.Value);
                }
            };
            processor.Process(exp);
        }
    }
}