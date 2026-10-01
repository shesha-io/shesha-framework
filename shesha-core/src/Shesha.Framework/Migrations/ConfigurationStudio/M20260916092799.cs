using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20260916092799)]
    public class M20260916092799 : OneWayMigration
    {
        public override void Up()
        {
            Create.Column("markup_issues_count").OnTable("form_configurations").InSchema("frwk").AsInt32().Nullable();
            Create.Column("is_markup_valid").OnTable("form_configurations").InSchema("frwk").AsBoolean().Nullable();
            Create.Column("validated_markup_md5").OnTable("form_configurations").InSchema("frwk").AsString(40).Nullable();
            Create.Column("markup_md5").OnTable("form_configurations").InSchema("frwk").AsString(40).Nullable();
        }
    }
}
