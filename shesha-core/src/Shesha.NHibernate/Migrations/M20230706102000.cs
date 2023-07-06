using FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20230706102000)]
    public class M20230706102000 : Migration
    {
        public override void Up()
        {

            Alter.Table("Frwk_DeviceForceUpdates").AddColumn("Frwk_Discriminator").AsString().Nullable();

        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}