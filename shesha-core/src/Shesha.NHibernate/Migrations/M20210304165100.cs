using System;
using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20210304165100)]
    public class M20210304165100: Migration
    {
        public override void Up()
        {
            Execute.Sql("CREATE INDEX IX_Frwk_StoredFiles_Owner ON Frwk_StoredFiles (Frwk_OwnerId, Frwk_OwnerType, CategoryLkp, IsDeleted)");
            
            Execute.Sql("CREATE INDEX IX_Core_CheckListItemSelections_Owner ON Core_CheckListItemSelections (Frwk_OwnerId, Frwk_OwnerType, IsDeleted)");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
