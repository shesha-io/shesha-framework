using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20260330100000)]
    public class M20260330100000 : OneWayMigration
    {
        public override void Up()
        {
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

            // Create a view that transforms startup + assembly + module data into a
            // list of applied releases — one row per unique module version per startup.
            IfDatabase("SqlServer").Execute.Sql(@"
                CREATE VIEW frwk.vw_module_release_history
                AS
                SELECT
                    a.id                                        AS id,
                    m.Id                                        AS module_id,
                    m.Name                                      AS module_name,
                    m.FriendlyName                              AS module_friendly_name,
                    a.file_version                              AS file_version,
                    a.product_version                           AS product_version,
                    a.file_name                                 AS file_name,
                    s.id                                        AS startup_id,
                    s.started_on                                AS started_on,
                    s.machine_name                              AS machine_name,
                    s.account                                   AS account,
                    s.folder                                    AS folder,
                    s.status                                    AS status
                FROM frwk_application_startup_assemblies a
                JOIN frwk_application_startups s ON s.id = a.application_startup_id
                JOIN Frwk_Modules m ON m.Id = a.module_id
            ");

            IfDatabase("PostgreSql").Execute.Sql(@"
                CREATE VIEW frwk.vw_module_release_history
                AS
                SELECT
                    a.id                                        AS id,
                    m.""Id""                                    AS module_id,
                    m.""Name""                                  AS module_name,
                    m.""FriendlyName""                          AS module_friendly_name,
                    a.file_version                              AS file_version,
                    a.product_version                           AS product_version,
                    a.file_name                                 AS file_name,
                    s.id                                        AS startup_id,
                    s.started_on                                AS started_on,
                    s.machine_name                              AS machine_name,
                    s.account                                   AS account,
                    s.folder                                    AS folder,
                    s.status                                    AS status
                FROM frwk_application_startup_assemblies a
                JOIN frwk_application_startups s ON s.id = a.application_startup_id
                JOIN ""Frwk_Modules"" m ON m.""Id"" = a.module_id
            ");
        }
    }
}
