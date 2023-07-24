using FluentMigrator;
using Shesha.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations
{
    [Migration(20230511110500), MsSqlOnly]
    public class M20230511110500 : Migration
    {
        public override void Up()
        {
            Alter.Table("Core_Sites").AddColumn("Frwk_Discriminator").AsString(SheshaDatabaseConsts.DiscriminatorMaxSize).NotNullable().WithDefaultValue("Core.Site");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
