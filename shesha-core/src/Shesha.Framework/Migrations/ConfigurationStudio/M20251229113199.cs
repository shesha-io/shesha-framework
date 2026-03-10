using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20251229113199)]
    public class M20251229113199 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Column("override_channels").OnTable("notification_types").InSchema("frwk").AsStringMax().Nullable();
        }
    }
}
