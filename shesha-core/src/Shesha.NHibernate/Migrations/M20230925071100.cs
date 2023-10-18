using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20230925071100)]
    public class M20230925071100 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_MobileDevices").AddColumn("LastHeartBeatTime").AsDateTime().Nullable();
            Alter.Table("Frwk_MobileDevices").AddColumn("LastLat").AsDecimal().Nullable();
            Alter.Table("Frwk_MobileDevices").AddColumn("LastLong").AsDecimal().Nullable();
            Alter.Table("Frwk_MobileDevices").AddColumn("LastBearing").AsDecimal().Nullable();
            Alter.Table("Frwk_MobileDevices").AddColumn("LastSpeed").AsDecimal().Nullable();
            Alter.Table("Frwk_MobileDevices").AddColumn("LastHeartBeatIsStationary").AsBoolean().Nullable();
            Alter.Table("Frwk_MobileDevices").AddColumn("StationaryTime").AsDateTime().Nullable();
            Alter.Table("Frwk_MobileDevices").AddColumn("StationaryLat").AsDecimal().Nullable();
            Alter.Table("Frwk_MobileDevices").AddColumn("StationaryLong").AsDecimal().Nullable();
        }
    }
}