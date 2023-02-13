using Abp.Extensions;
using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200417142700)]
    public class M20200417142700 : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Core_Organisations")
                .AddColumn("ExtSysFirstSyncDate").AsDateTime().Nullable()
                .AddColumn("ExtSysId").AsString(50).Nullable()
                .AddColumn("ExtSysLastSyncDate").AsDateTime().Nullable()
                .AddColumn("ExtSysSource").AsString(50).Nullable()
                .AddColumn("ExtSysSyncError").AsStringMax().Nullable()
                .AddColumn("ExtSysSyncStatusLkp").AsInt32().Nullable();
        }
    }
}