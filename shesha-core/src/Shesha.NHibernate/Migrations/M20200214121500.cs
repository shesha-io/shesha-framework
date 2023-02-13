using System;
using FluentMigrator;
using Shesha.Domain;

namespace Shesha.Migrations
{
    [Migration(20200214121500)]
    public class M20200214121500: Migration
    {
        public override void Up()
        {
            Delete.ForeignKey("FK_Core_ShaRoleAppointments_WorkflowRoleId_Core_ShaRoles_Id").OnTable("Core_ShaRoleAppointments");
            Delete.Index("IX_Core_ShaRoleAppointments_WorkflowRoleId").OnTable("Core_ShaRoleAppointments");
            
            Rename.Column("WorkflowRoleId").OnTable("Core_ShaRoleAppointments").To("RoleId");

            Alter.Table("Core_ShaRoleAppointments").AlterColumn("RoleId").AsGuid().ForeignKey("Core_ShaRoles", SheshaDatabaseConsts.IdColumn).Indexed();
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
