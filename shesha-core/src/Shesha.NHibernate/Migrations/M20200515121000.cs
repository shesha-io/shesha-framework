using System.Collections.Generic;
using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200515121000)]
    public class M20200515121000: AutoReversingMigration
    {
        public override void Up()
        {
            var columns = new List<string>
            {
                "EmailAddressConfirmed",
                "IsLocked",
                "MobileNumberConfirmed",
                "OtpEnabled",
                "RequireChangePassword"
            };
            foreach (var column in columns)
            {
                Alter.Table("Core_Persons").AlterColumn(column).AsBoolean().WithDefaultValue(0);
            }

            Alter.Table("Core_OrganisationBankAccounts").AlterColumn("Inactive").AsBoolean().WithDefaultValue(0);
        }
    }
}
