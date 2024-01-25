
using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240123142500)]
    public class M20240123142500 : AutoReversingMigration
    {
        public override void Up()
        {
			Alter.Table("Core_Accounts")
				.AddColumn("ContactEmail").AsString(50).Nullable()
				.AddColumn("ContactTelephone").AsString(50).Nullable()
				.AddColumn("FreeTextBillingAddress").AsString(400).Nullable()
				.AddForeignKeyColumn("BillingAddressId", "Core_Addresses").Nullable();
		}
    }
}