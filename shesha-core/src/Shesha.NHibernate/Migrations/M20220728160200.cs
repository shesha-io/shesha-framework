using FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations
{
    [Migration(20220728160200), MsSqlOnly]
    public class M20220728160200 : Migration
    {
        public override void Up()
        {
            Alter.Table("Frwk_MobileDevices").AddColumn("ReadRouteName").AsString().Nullable();
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }

    }
}