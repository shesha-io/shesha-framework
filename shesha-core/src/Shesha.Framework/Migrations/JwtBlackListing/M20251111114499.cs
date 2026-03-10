using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.JwtBlackListing
{
    [Migration(20251111114499)]
    public class M20251111114499 : OneWayMigration
    {
        public override void Up()
        {
            if (!Schema.Schema("frwk").Exists())
                Create.Schema("frwk");

            Create.Table("blacklist_tokens").InSchema("frwk")
                .WithColumn("token").AsString(40).NotNullable().PrimaryKey()
                .WithColumn("blacklisted_on").AsDateTime().NotNullable()
                .WithColumn("expires_on").AsDateTime().Nullable();
        }
    }
}
