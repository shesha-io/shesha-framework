using System;
using FluentMigrator;
using Shesha.Domain;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20240604203200), MsSqlOnly]
    public class M20240604203200 : Migration
    {
        /// <summary>
        /// 
        /// </summary>
        public override void Up()
        {
            Alter.Table("Core_Persons").AddColumn("SheshaFunctionalTests_Base64String").AsStringMax().Nullable();
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