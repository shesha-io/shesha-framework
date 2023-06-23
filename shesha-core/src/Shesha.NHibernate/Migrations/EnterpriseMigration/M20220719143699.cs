//using FluentMigrator;
//using System;

//namespace Shesha.Migrations.EnterpriseMigration
//{
//    [Migration(20220719143699), MsSqlOnly]
//    public class M20220719143699 : Migration
//    {
//        public override void Down()
//        {
//            throw new NotImplementedException();
//        }

//        public override void Up()
//        {
//            //Execute.Sql(@"update Core_Organisations set Frwk_Discriminator = 'entpr.Supplier' where Frwk_Discriminator = 'Core.Supplier'");
//            //Execute.Sql(@"update entpr_Orders set Frwk_Discriminator = 'entpr.Order' where Frwk_Discriminator = 'Core.Order'");
//            //Execute.Sql(@"update entpr_ImportResults set Frwk_Discriminator = 'entpr.ImportResult' where Frwk_Discriminator = 'Core.ImportResult'");

//            Execute.Sql(@"update 
//	Core_Organisations
//set
//	ContactEmail = entpr_Email,
//	ContactMobileNo = entpr_TellNo,
//	PrimaryAddressId = entpr_AddressId
//where
//	Frwk_Discriminator = 'entpr.Supplier'
//");

//            Delete.Column("entpr_Email").FromTable("Core_Organisations");
//            Delete.Column("entpr_TellNo").FromTable("Core_Organisations");

//            Delete.ForeignKey("FK_Core_Organisations_AddressId_Core_Addresses_Id").OnTable("Core_Organisations");
//            Delete.Index("IX_Core_Organisations_AddressId").OnTable("Core_Organisations");
//            Delete.Column("entpr_AddressId").FromTable("Core_Organisations");
//        }
//    }
//}
