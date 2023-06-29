using FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20230629154200)]
    public class M20230629154200 : Migration
    {
        public override void Up()
        {
            Alter.Table("Core_ShaRoleAppointments").AddColumn("FromDate").AsDateTime().Nullable();
            Alter.Table("Core_ShaRoleAppointments").AddColumn("ToDate").AsDateTime().Nullable();
            Alter.Table("Core_ShaRoleAppointments").AddColumn("StatusLkp").AsInt64().Nullable();


            Alter.Table("Core_ShaRoleAppointments").AddColumn("PermissionedEntity1Id").AsString(100).Nullable();
            Alter.Table("Core_ShaRoleAppointments").AddColumn("PermissionedEntity1ClassName").AsString(1000).Nullable();
            
            Alter.Table("Core_ShaRoleAppointments").AddColumn("PermissionedEntity2Id").AsString(100).Nullable();
            Alter.Table("Core_ShaRoleAppointments").AddColumn("PermissionedEntity2ClassName").AsString(1000).Nullable();
            
            Alter.Table("Core_ShaRoleAppointments").AddColumn("PermissionedEntity3Id").AsString(100).Nullable();
            Alter.Table("Core_ShaRoleAppointments").AddColumn("PermissionedEntity3ClassName").AsString(1000).Nullable();
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
