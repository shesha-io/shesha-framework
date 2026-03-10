using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20240326212600)]
    public class M20240326212600 : OneWayMigration
    {
        /// <summary>
        /// 
        /// </summary>
        public override void Up()
        {
            Alter.Table("SheshaFunctionalTests_TestAccounts").AddForeignKeyColumn("CaptureFormId", "Frwk_FormConfigurations").Nullable();
        }        
    }
}