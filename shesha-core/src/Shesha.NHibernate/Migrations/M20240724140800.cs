using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20240724140800)]
    public class M20240724140800 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_ConfigurationItems").AddForeignKeyColumnInt64("UserId", "AbpUsers").Nullable();
        }
    }
}