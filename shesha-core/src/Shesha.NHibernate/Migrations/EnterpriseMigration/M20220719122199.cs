using FluentMigrator;

namespace Shesha.Migrations.EnterpriseMigration
{
    [Migration(20220719122199), MsSqlOnly]
    public class M20220719122199 : AutoReversingMigration
    {
        public override void Up()
        {
            SafeRenameTable("Core_BankAccounts", "entpr_BankAccounts");
            SafeRenameTable("Core_DistributionLists", "entpr_DistributionLists");
            SafeRenameTable("Core_DistributionListItems", "entpr_DistributionListItems");
            SafeRenameTable("Core_LogonMessages", "entpr_LogonMessages");
            SafeRenameTable("Core_LogonMessageAuditItems", "entpr_LogonMessageAuditItems");
            SafeRenameTable("Core_Orders", "entpr_Orders");
            //Rename.Table("Core_OrganisationBankAccounts").To("entpr_OrganisationBankAccounts");
            SafeRenameTable("Core_OrganisationPosts", "entpr_OrganisationPosts");
            SafeRenameTable("Core_OrganisationPostAppointments", "entpr_OrganisationPostAppointments");
            SafeRenameTable("Core_OrganisationPostLevels", "entpr_OrganisationPostLevels");
            SafeRenameTable("Core_Periods", "entpr_Periods");
            SafeRenameTable("Core_Services", "entpr_Services");

            SafeRenameTable("Core_ImportResults", "Frwk_ImportResults");
        }

        private void SafeRenameTable(string oldName, string newName) 
        {
            if (Schema.Table(oldName).Exists() && !Schema.Table(newName).Exists()) 
            {
                Rename.Table(oldName).To(newName);
            }
        }
    }
}
