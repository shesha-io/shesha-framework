using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20230605103600), MsSqlOnly]
    public class M20230605103600 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Core_NotificationMessages").AddColumn("SenderText").AsString().Nullable();
            Alter.Table("Core_NotificationMessages").AddColumn("DirectionLkp").AsInt64().Nullable();
            Alter.Table("Core_NotificationMessages").AddColumn("Cc").AsString().Nullable();

            Alter.Table("Core_NotificationMessages").AddColumn(DatabaseConsts.ExtSysFirstSyncDate).AsDateTime().Nullable();
            Alter.Table("Core_NotificationMessages").AddColumn(DatabaseConsts.ExtSysId).AsString(50).Nullable();
            Alter.Table("Core_NotificationMessages").AddColumn(DatabaseConsts.ExtSysLastSyncDate).AsDateTime().Nullable();
            Alter.Table("Core_NotificationMessages").AddColumn(DatabaseConsts.ExtSysSource).AsString(50).Nullable();
            Alter.Table("Core_NotificationMessages").AddColumn(DatabaseConsts.ExtSysSyncError).AsStringMax().Nullable();
            Alter.Table("Core_NotificationMessages").AddColumn(DatabaseConsts.ExtSysSyncStatusLkp).AsInt32().Nullable();
        }
    }
}
