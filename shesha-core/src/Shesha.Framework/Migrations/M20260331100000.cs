using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20260331100000)]
    public class M20260331100000 : OneWayMigration
    {
        public override void Up()
        {
            // Add build_id to assembly records.
            // Populated from AssemblyMetadata("BuildId") when set by the CI/CD pipeline,
            // falling back to ProductVersion until the pipeline is configured.
            Alter.Table("frwk_application_startup_assemblies")
                .AddColumn("build_id").AsString(100).Nullable();
        }
    }
}
