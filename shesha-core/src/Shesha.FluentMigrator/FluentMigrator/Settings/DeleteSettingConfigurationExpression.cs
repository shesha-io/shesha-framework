using FluentMigrator;
using FluentMigrator.Expressions;

namespace Shesha.FluentMigrator.Settings
{
    /// <summary>
    /// Delete setting configuration expression
    /// </summary>
    public class DeleteSettingConfigurationExpression : SheshaMigrationExpressionBase
    {
        private readonly string _migrationModule;

        public DeleteSettingConfigurationExpression(DbmsType dbmsType, IQuerySchema querySchema, string migrationModule, string name) : base(dbmsType, querySchema)
        {
            _migrationModule = migrationModule;
            Name = name;
        }

        /// <summary>
        /// Setting name
        /// </summary>
        public string Name { get; set; }

        public PropertyUpdateDefinition<string> Module { get; set; } = new PropertyUpdateDefinition<string>();

        public override void ExecuteWith(IMigrationProcessor processor)
        {
            var exp = new PerformDBOperationExpression()
            {
                Operation = (connection, transaction) => {
                    var helper = new SettingsDbHelper(DbmsType, connection, transaction, QuerySchema);

                    var module = Module.IsSet ? Module.Value : _migrationModule;
                    var id = helper.GetSettingId(module, Name);
                    if (id == null)
                        throw new SheshaMigrationException($"Settings with name `{Name}` not found in module `{module}`");

                    helper.DeleteSettingDefinition(id.Value);
                }
            };
            processor.Process(exp);
        }
    }
}
