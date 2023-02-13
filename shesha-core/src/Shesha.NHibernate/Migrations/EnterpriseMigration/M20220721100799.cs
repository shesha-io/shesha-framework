using FluentMigrator;
using System;

namespace Shesha.Migrations.EnterpriseMigration
{
    [Migration(20220721100799)]
    public class M20220721100799 : Migration
    {
        public override void Down()
        {
            throw new NotImplementedException();
        }

        public override void Up()
        {
            Delete.Table("Frwk_StoredFilterRelations");
            Delete.Table("Frwk_StoredFilterContainers");
            Delete.Table("Frwk_StoredFilters");

            Delete.Table("Core_TeamMembers");            
        }
    }
}
