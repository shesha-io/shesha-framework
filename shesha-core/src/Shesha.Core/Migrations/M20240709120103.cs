using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations
{
    [Migration(20240709120103)]
    public class M20240709120103 : OneWayMigration
    {
        public override void Up()
        {
            // Add a reference list for AccountInvitationStatus
            this.Shesha().ReferenceListCreate("Shesha.Core", "AccountInvitationStatus")
                .SetDescription("Account Invitation Status") // set desctiption
                .SetNoSelectionValue(1) // set noselection value
                .AddItem(1, "Invited")
                .AddItem(2, "Registration")
                .AddItem(3, "Expired")
                .AddItem(4, "Cancelled");

            // Create the AccountInvitation table
            Create.Table("Core_AccountInvitations")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithDiscriminator()
                .WithColumn("SentDate").AsDateTime().NotNullable()
                .WithColumn("SentById").AsGuid().ForeignKey("Core_Persons", "Id").NotNullable()
                .WithColumn("ExpiryDate").AsDateTime().Nullable()
                .WithColumn("StatusLkp").AsInt64().NotNullable()
                .WithColumn("RegistrationUrl").AsString(2000).Nullable()
                .WithColumn("Email").AsString(200).Nullable()
                .WithColumn("MobileNumber").AsString(20).Nullable()
                .WithColumn("OrganisationId").AsGuid().ForeignKey("Core_Organisations", "Id").Nullable()
                .WithColumn("AccountId").AsGuid().ForeignKey("Core_Accounts", "Id").Nullable()
                .WithColumn("FirstName").AsString(50).Nullable()
                .WithColumn("LastName").AsString(50).Nullable()
                .WithColumn("RoleName").AsString().Nullable()
                .WithColumn("RoleId").AsGuid().ForeignKey("Core_ShaRoles", "Id").Nullable()
                .WithColumn("PersonId").AsGuid().ForeignKey("Core_Persons", "Id").Nullable()
                .WithColumn("ExtensionJs").AsStringMax().Nullable()
                .WithColumn("RegistrationOTP").AsString(12).Nullable()
                .WithColumn("RegistrationOTPExpiry").AsDateTime().Nullable()
                .WithColumn("RegistrationExpiry").AsDateTime().Nullable();
        }
    }
}
