using FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20230704153700)]
    public class M20230704153700 : Migration
    {
        public override void Up()
        {

            Alter.Table("Core_ShaRoleAppointments").AddColumn("PermissionedEntity1DisplayName").AsString(1000).Nullable();

            Alter.Table("Core_ShaRoleAppointments").AddColumn("PermissionedEntity2DisplayName").AsString(1000).Nullable();

            Alter.Table("Core_ShaRoleAppointments").AddColumn("PermissionedEntity3DisplayName").AsString(1000).Nullable();

        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}