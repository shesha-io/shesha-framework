using FluentMigrator;

namespace Shesha.Migrations.EnterpriseMigration
{
    [Migration(20220719125699)]
    public class M20220719125699 : AutoReversingMigration
    {
        public override void Up()
        {
            Rename.Column("SupplierNo").OnTable("Core_Organisations").To("entpr_SupplierNo");
            Rename.Column("Email").OnTable("Core_Organisations").To("entpr_Email");
            Rename.Column("TellNo").OnTable("Core_Organisations").To("entpr_TellNo");
            Rename.Column("AddressId").OnTable("Core_Organisations").To("entpr_AddressId");
            Rename.Column("StatusLkp").OnTable("Core_Organisations").To("entpr_SupplierStatusLkp");
        }
    }
}
