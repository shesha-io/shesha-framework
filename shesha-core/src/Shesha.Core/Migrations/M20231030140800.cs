using FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations
{
    [Migration(20231030140800), MsSqlOnly]
    public class M20231030140800 : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Core_Persons").AddColumn("TargetingFlag").AsInt64().Nullable();
        }
    }
}
