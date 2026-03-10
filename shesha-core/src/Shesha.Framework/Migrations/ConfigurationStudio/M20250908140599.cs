using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250908140599)]
    public class M20250908140599 : OneWayMigration
    {
        public override void Up()
        {
            ExecuteCsScript("Revisions2Json.sql");
        }

        private void ExecuteCsScript(string script)
        {
            IfDatabase("SqlServer").Execute.EmbeddedScript($"Shesha.Migrations.ConfigurationStudio.ScriptsMsSql.{script}");
            IfDatabase("PostgreSql").Execute.EmbeddedScript($"Shesha.Migrations.ConfigurationStudio.ScriptsPostgreSql.{script}");
        }
    }
}
