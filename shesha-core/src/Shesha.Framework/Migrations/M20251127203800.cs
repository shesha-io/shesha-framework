using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20251127203800)]
    public class M20251127203800 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("entity_properties").InSchema("frwk")
                .AddColumn("init_status").AsInt16().NotNullable().WithDefaultValue(0)
                .AddColumn("init_message").AsStringMax().Nullable();

            Alter.Table("entity_configs").InSchema("frwk")
                .AddColumn("init_status").AsInt16().NotNullable().WithDefaultValue(0)
                .AddColumn("init_message").AsStringMax().Nullable();
        }
    }
}
