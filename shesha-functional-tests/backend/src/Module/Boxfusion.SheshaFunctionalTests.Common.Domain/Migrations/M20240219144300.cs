using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20240219144300)]
    public class M20240219144300 : OneWayMigration
    {
        /// <summary>
        /// 
        /// </summary>
        public override void Up()
        {
            Alter.Table("SheshaFunctionalTests_MembershipPayments").AddColumn("PaymentTypeLkp").AsInt64().Nullable();
        }
    }
}