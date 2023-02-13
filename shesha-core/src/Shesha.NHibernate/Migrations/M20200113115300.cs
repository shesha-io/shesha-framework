using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    
    [Migration(20200113115300)]
    public class M20200113115300 : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Core_Organisations")
                .AddForeignKeyColumn("ParentId", "Core_Organisations");
        }
    }
}
