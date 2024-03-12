using System;
using FluentMigrator;
using Shesha.Domain;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20240312143300), MsSqlOnly]
    public class M20240312143300 : Migration
    {
        /// <summary>
        /// 
        /// </summary>
        public override void Up()
        {
            Alter.Table("Core_Persons")
                .AddForeignKeyColumn("SheshaFunctionalTests_DetailsFormId", "Frwk_FormConfigurations");

            Alter.Table("SheshaFunctionalTests_Banks")
               .AddForeignKeyColumn("DetailsFormId", "Frwk_FormConfigurations");
        }

        /// <summary>
        /// 
        /// </summary>
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}