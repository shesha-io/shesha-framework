using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations.PostgreSql
{
    [Migration(20230623135799), PostgreSqlOnly]
    public class M20230623135799 : OneWayMigration
    {
        public override void Up()
        {
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.Core_DistanceTo.sql");
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.Frwk_GetMultiValueRefListItemNames.sql");
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.Frwk_GetRefListItem.sql");
        }
    }
}
