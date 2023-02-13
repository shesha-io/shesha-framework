using FluentMigrator;

namespace Shesha.NHibernate.Migrations
{
    [Migration(20200711111600)]
    public class M20200711111600 : AutoReversingMigration
    {
        public override void Up()
        {
            // Shesha.Domain.Supplier
            Alter.Table("Core_Organisations")
                .AddColumn("Email").AsString(50).Nullable()
                .AddColumn("TellNo").AsString(50).Nullable()
                ;
        }
    }
}
