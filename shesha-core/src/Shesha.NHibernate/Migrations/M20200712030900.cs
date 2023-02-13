using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Enterprise.Migrations
{
    [Migration(20200712030900)]
    public class M20200712030900 : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Core_Organisations")
                .AddForeignKeyColumn("AddressId", "Core_Areas");
        }
    }
}