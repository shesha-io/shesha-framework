using FluentMigrator;
using Shesha.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations
{
    [Migration(20230412095600)]
    public class M20230412095600 : Migration
    {
        public override void Up()
        {
            Alter.Column("Frwk_Discriminator").OnTable("Core_Accounts").AsString(SheshaDatabaseConsts.DiscriminatorMaxSize).NotNullable().WithDefaultValue("");
        }

        public override void Down()
        {
        }
    }
}
