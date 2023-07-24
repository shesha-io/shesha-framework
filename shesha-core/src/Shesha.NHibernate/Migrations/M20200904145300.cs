using FluentMigrator;

namespace Shesha.Enterprise.Migrations
{
    [Migration(20200904145300), MsSqlOnly]
    public class M20200904145300 : AutoReversingMigration
    {
        public override void Up()
        {
            if (!Schema.Table("Core_Persons").Column("isContractor").Exists())
                Alter.Table("Core_Persons").AddColumn("IsContractor").AsBoolean().Nullable();
        }
    }
}
