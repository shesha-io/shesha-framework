using FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations.Framework
{
    [Migration(20211220160600)]
    public class M20211220160600 : Migration
    {
        public override void Up()
        {
            Execute.Sql("delete from Frwk_EntityProperties");
            Execute.Sql("delete from Frwk_EntityConfigs");

            Create.UniqueConstraint("uq_Frwk_EntityConfigs_Namespace_ClassName")
                .OnTable("Frwk_EntityConfigs").Columns("ClassName", "Namespace", "DeletionTime");

            //Create.UniqueConstraint("uq_Frwk_EntityProperties_EntityConfigId_Name")
            //    .OnTable("Frwk_EntityProperties").Columns("EntityConfigId", "Name", "DeletionTime");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
