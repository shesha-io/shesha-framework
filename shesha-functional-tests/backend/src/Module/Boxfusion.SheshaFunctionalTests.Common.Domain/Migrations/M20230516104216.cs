using System;
using FluentMigrator;
using Shesha.Domain;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230516104216), MsSqlOnly]
    public class M20230516104216 : Migration
    {
        /// <summary>
        /// 
        /// </summary>
        public override void Up()
        {

            Create.Table("SheshaFunctionalTests_Books")
             .WithIdAsGuid()
             .WithFullAuditColumns()
             .WithColumn("Frwk_Discriminator").AsString(SheshaDatabaseConsts.DiscriminatorMaxSize).NotNullable()
             .WithColumn("Name").AsString().Nullable()
             .WithColumn("Description").AsString().Nullable()
             .WithColumn("Price").AsDecimal();


            Create.Table("SheshaFunctionalTests_Schools")
             .WithIdAsGuid()
             .WithFullAuditColumns()
             .WithColumn("Frwk_Discriminator").AsString(SheshaDatabaseConsts.DiscriminatorMaxSize).NotNullable()
             .WithColumn("Name").AsString().Nullable()
             .WithColumn("Latitude").AsDecimal().Nullable()
             .WithColumn("Longitude").AsDecimal()
             .WithColumn("ContactNumber").AsString().Nullable();


            Create.Table("SheshaFunctionalTests_Subjects")
             .WithIdAsGuid()
             .WithFullAuditColumns()
             .WithColumn("Frwk_Discriminator").AsString(SheshaDatabaseConsts.DiscriminatorMaxSize).NotNullable()
             .WithColumn("Name").AsString().Nullable()
             .WithColumn("Description").AsString().Nullable()
             .WithColumn("Total").AsDecimal().Nullable();


            Alter.Table("SheshaFunctionalTests_Schools").AddForeignKeyColumn("AddressId", "Core_Addresses").Nullable();

            Alter.Table("SheshaFunctionalTests_Schools").AddForeignKeyColumn("HeadLeaderId", "Core_Persons").Nullable();

            Alter.Table("SheshaFunctionalTests_Subjects").AddForeignKeyColumn("BookId", "SheshaFunctionalTests_Books").Nullable();

            Alter.Table("SheshaFunctionalTests_Subjects").AddForeignKeyColumn("SchoolId", "SheshaFunctionalTests_Schools").Nullable();

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