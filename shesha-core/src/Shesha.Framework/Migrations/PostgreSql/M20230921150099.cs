using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations.PostgreSql
{
    [Migration(20230921150099)]
    public class M20230921150099 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("PostgreSql").Execute.Sql("drop view \"vw_Core_EntityHistoryItems\"");

            IfDatabase("PostgreSql").Delete.Column("FullName").FromTable("Core_Persons");

            IfDatabase("PostgreSql").Execute.Sql("alter table \"Core_Persons\" add \"FullName\" citext GENERATED ALWAYS AS (coalesce(\"FirstName\" || ' ', '') || coalesce(\"LastName\", '')) stored");

            IfDatabase("PostgreSql").Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.vw_Core_EntityHistoryItems.sql");
        }
    }
}
