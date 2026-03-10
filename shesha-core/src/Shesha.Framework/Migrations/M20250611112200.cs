using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20250611112200)]
    public class M20250611112200 : OneWayMigration
    {
        public override void Up()
        {
            if (!Schema.Table("frwk_bootstrapper_startups").Exists())
            {
                Create.Table("frwk_bootstrapper_startups")
                    .WithIdAsGuid("id")
                    .WithColumn("creation_time").AsDateTime().NotNullable()
                    .WithColumn("force").AsBoolean().NotNullable().WithDefaultValue(false)
                    .WithColumn("bootstrapper_name").AsString(1000).Nullable()
                    .WithColumn("status").AsInt32().NotNullable().WithDefaultValue(0)
                    .WithColumn("started_on").AsDateTime().Nullable()
                    .WithColumn("finished_on").AsDateTime().Nullable()
                    .WithColumn("result").AsString(1000).Nullable()
                    .WithColumn("context").AsStringMax().Nullable()
                ;
            }
        }
    }
}