using System;
using FluentMigrator;
using Shesha.Domain;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20231031120400), MsSqlOnly]
    public class M20231031120400 : Migration
    {
        /// <summary>
        /// 
        /// </summary>
        public override void Up()
        {
            Alter.Table("Core_Persons").AddColumn("SheshaFunctionalTests_OrderIndex").AsInt32().Nullable();
            Alter.Table("SheshaFunctionalTests_Employees").AddColumn("OrderIndex").AsInt32().Nullable();
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