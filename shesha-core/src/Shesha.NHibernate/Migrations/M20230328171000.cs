using FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20230328171000), MsSqlOnly]
    public class M20230328171000 : Migration
    {
        public override void Up()
        {
            Alter.Table("Core_Sites").AddColumn("SiteSubTypeLkp").AsInt64().Nullable();
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}