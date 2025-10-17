using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20231031120400)]
    public class M20231031120400 : OneWayMigration
    {
        /// <summary>
        /// 
        /// </summary>
        public override void Up()
        {
            Alter.Table("Core_Persons").AddColumn("SheshaFunctionalTests_OrderIndex").AsInt32().Nullable();
            Alter.Table("SheshaFunctionalTests_Employees").AddColumn("OrderIndex").AsInt32().Nullable();
        }
    }
}