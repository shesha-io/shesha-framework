using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20240604203200)]
    public class M20240604203200 : OneWayMigration
    {
        /// <summary>
        /// 
        /// </summary>
        public override void Up()
        {
            Alter.Table("Core_Persons").AddColumn("SheshaFunctionalTests_Base64String").AsStringMax().Nullable();
        }
    }
}