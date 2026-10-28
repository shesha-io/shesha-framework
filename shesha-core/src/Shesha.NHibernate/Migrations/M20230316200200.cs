using FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20230316200200), MsSqlOnly]
    public class M20230316200200 : Migration
    {
        public override void Up()
        {
            Alter.Table("Core_Areas").AddColumn("AreaSubTypeLkp").AsInt64().Nullable();
            Alter.Table("Core_Areas").AddColumn("AreaSize").AsDecimal().Nullable();
            Alter.Table("Core_Areas").AddColumn("Latitude").AsDecimal().Nullable();
            Alter.Table("Core_Areas").AddColumn("Longitude").AsDecimal().Nullable();
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}