using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Enterprise.Migrations
{
    [Migration(20200712114600)]
    public class M20200712114600 : Migration
    {
        public override void Down()
        {
            throw new System.NotImplementedException();
        }

        public override void Up()
        {

            Delete.ForeignKey("FK_Core_Organisations_AddressId_Core_Areas_Id").OnTable("Core_Organisations");
            Delete.Index("IX_Core_Organisations_AddressId").OnTable("Core_Organisations");

            Delete.Column("AddressId").FromTable("Core_Organisations");

            Alter.Table("Core_Organisations")
                .AddForeignKeyColumn("AddressId", "Core_Addresses");
        }
    }
}