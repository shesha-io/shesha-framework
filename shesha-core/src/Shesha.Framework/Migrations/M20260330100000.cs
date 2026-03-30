using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20260330100000)]
    public class M20260330100000 : OneWayMigration
    {
        public override void Up()
        {
            // Add release tracking columns to application_startups.
            // has_modules_changed: true when at least one module assembly changed version/md5 vs the previous startup.
            // main_module_version: version of the root (startup) module assembly at the time of this startup.
            Alter.Table("frwk_application_startups")
                .AddColumn("has_modules_changed").AsBoolean().NotNullable().WithDefaultValue(false)
                .AddColumn("main_module_version").AsString(100).Nullable();

            // Add module_id FK to assembly records so we can show per-module version history per deployment.
            Alter.Table("frwk_application_startup_assemblies")
                .AddColumn("module_id").AsGuid().Nullable()
                .ForeignKey("fk_frwk_startup_assemblies_module", "Frwk_Modules", "Id");

            // Backfill module_id using a ranked CTE to always pick the most specific
            // (longest) module name match, avoiding non-deterministic assignment when
            // module names share a common prefix (e.g. "Shesha" vs "Shesha.Framework").
            IfDatabase("SqlServer").Execute.Sql(@"
                WITH ranked AS (
                    SELECT a.id AS assembly_id, m.Id AS module_id,
                           ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY LEN(m.Name) DESC) AS rn
                    FROM frwk_application_startup_assemblies a
                    JOIN Frwk_Modules m ON LEFT(a.file_name, LEN(m.Name) + 1) = m.Name + '.'
                    WHERE a.module_id IS NULL
                )
                UPDATE a
                SET a.module_id = r.module_id
                FROM frwk_application_startup_assemblies a
                JOIN ranked r ON r.assembly_id = a.id AND r.rn = 1
            ");

            IfDatabase("PostgreSql").Execute.Sql(@"
                UPDATE frwk_application_startup_assemblies a
                SET module_id = sub.module_id
                FROM (
                    SELECT DISTINCT ON (a2.id) a2.id AS assembly_id, m.""Id"" AS module_id
                    FROM frwk_application_startup_assemblies a2
                    JOIN ""Frwk_Modules"" m ON substring(a2.file_name, 1, LENGTH(m.""Name"") + 1) = m.""Name"" || '.'
                    WHERE a2.module_id IS NULL
                    ORDER BY a2.id, LENGTH(m.""Name"") DESC
                ) sub
                WHERE a.id = sub.assembly_id
            ");
        }
    }
}
