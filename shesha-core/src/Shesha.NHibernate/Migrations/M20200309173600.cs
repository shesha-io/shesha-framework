using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200309173600)]
    public class M20200309173600: AutoReversingMigration
    {
        public override void Up()
        {
            // Shesha.Domain.Supplier
            Alter.Table("Core_Organisations")
                .AddColumn("SupplierNo").AsString(50).Nullable();
        }
    }
}
