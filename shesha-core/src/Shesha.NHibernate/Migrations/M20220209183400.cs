using FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20220209183400), MsSqlOnly]
    public class M20220209183400 : Migration
    {
        public override void Up()
        {
            Alter.Table("Frwk_VersionedFields").AlterColumn("Name").AsString(1023);

            Execute.Sql("CREATE UNIQUE INDEX UQ_Frwk_Name_Owner_NotDeleted ON Frwk_VersionedFields (Name, Frwk_OwnerId, Frwk_OwnerType) WHERE (IsDeleted = 0)");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
