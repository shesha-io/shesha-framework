using System;
using FluentMigrator;
using Shesha.Domain;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20240219144300), MsSqlOnly]
    public class M20240219144300 : Migration
    {
        /// <summary>
        /// 
        /// </summary>
        public override void Up()
        {
            Alter.Table("SheshaFunctionalTests_MembershipPayments").AddColumn("PaymentTypeLkp").AsInt64().Nullable();
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