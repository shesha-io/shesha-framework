using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20260330100000)]
    public class M20260330100000 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"
                UPDATE a
                SET a.module_id = m.Id
                FROM frwk_application_startup_assemblies a
                CROSS JOIN Frwk_Modules m
                WHERE a.module_id IS NULL
                  AND (
                      a.file_name = m.Name + '.dll'
                   OR a.file_name LIKE m.Name + '.%'
                  )
            ");

            IfDatabase("PostgreSql").Execute.Sql(@"
                UPDATE frwk_application_startup_assemblies a
                SET module_id = m.""Id""
                FROM ""Frwk_Modules"" m
                WHERE a.module_id IS NULL
                  AND (
                      a.file_name = m.""Name"" || '.dll'
                   OR a.file_name LIKE m.""Name"" || '.%'
                  )
            ");

            // Create a view that transforms startup + assembly + module data into a
            // list of applied releases — one row per unique module version per startup.
            IfDatabase("SqlServer").Execute.Sql(@"
                CREATE VIEW vw_Frwk_ModuleReleaseHistory
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
                CREATE VIEW vw_Frwk_ModuleReleaseHistory
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
