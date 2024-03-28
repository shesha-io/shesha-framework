using System;
using FluentMigrator;
using Shesha.Domain;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20240326212600), MsSqlOnly]
    public class M20240326212600 : Migration
    {
        /// <summary>
        /// 
        /// </summary>
        public override void Up()
        {
            Alter.Table("SheshaFunctionalTests_TestAccounts").AddForeignKeyColumn("CaptureFormId", "Frwk_FormConfigurations").Nullable();
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