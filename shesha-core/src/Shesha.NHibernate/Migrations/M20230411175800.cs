using FluentMigrator;
using Shesha.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations
{
    [Migration(20230411175800), MsSqlOnly]
    public class M20230411175800 : Migration
    {
        public override void Up()
        {
            Alter.Table("Core_Accounts").AddColumn("Frwk_Discriminator").AsString(SheshaDatabaseConsts.DiscriminatorMaxSize).NotNullable().WithDefaultValue("Core.Account");

        }

        public override void Down()
        {
        }
    }
}
