using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250826114399)]
    public class M20250826114399 : OneWayMigration
    {
        public override void Up()
        {
            Delete.Column("order_index").FromTable("notification_type_revisions").InSchema("frwk");
        }
    }
}
