using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240927145399)]
    public class M20240927145399 : OneWayMigration
    {
        public override void Up()
        {
            // Shesha.Domain.ApplicationStartup
            Create.Table("frwk_application_startups")
                .WithIdAsGuid("id")
                .WithColumn("account").AsString(100).Nullable()
                .WithColumn("error_message").AsStringMax().Nullable()
                .WithColumn("finished_on").AsDateTime().Nullable()
                .WithColumn("folder").AsStringMax().Nullable()
                .WithColumn("machine_name").AsString(100).Nullable()
                .WithColumn("started_on").AsDateTime()
                .WithColumn("bootstrappers_disabled").AsBoolean()
                .WithColumn("migrations_disabled").AsBoolean()
                .WithColumn("status").AsInt64();

            // Shesha.Domain.ApplicationStartupAssembly
            Create.Table("frwk_application_startup_assemblies")
                .WithIdAsGuid("id")
                .WithColumn("file_md5").AsString(50).Nullable()
                .WithColumn("file_name").AsStringMax().Nullable()
                .WithColumn("file_path").AsStringMax().Nullable()
                .WithColumn("file_version").AsString(100).Nullable()
                .WithColumn("product_version").AsString(100).Nullable();

            // Shesha.Domain.ApplicationStartupAssembly
            Alter.Table("frwk_application_startup_assemblies")
                .AddForeignKeyColumn("application_startup_id", "frwk_application_startups", "id");
        }
    }
}
