using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations.EnterpriseMigration
{

    [Migration(20220719145199)]
    public class M20220719145199 : Migration
    {
        public override void Down()
        {
            throw new NotImplementedException();
        }

        public override void Up()
        {
            Alter.Table("Core_ShaRoleAppointments").AddForeignKeyColumn("entpr_OrganisationPostId", "entpr_OrganisationPosts");
            Alter.Table("Core_ShaRoleAppointments").AddForeignKeyColumn("entpr_OrganisationPostLevelId", "entpr_OrganisationPostLevels");

            Execute.Sql("update Core_ShaRoleAppointments set entpr_OrganisationPostId = OrganisationPostId where OrganisationPostId is not null");
            Execute.Sql("update Core_ShaRoleAppointments set entpr_OrganisationPostLevelId = OrganisationPostLevelId where OrganisationPostLevelId is not null");

            Delete.ForeignKey("FK_Core_ShaRoleAppointments_OrganisationPostId_Core_OrganisationPosts_Id").OnTable("Core_ShaRoleAppointments");
            Delete.Index("IX_Core_ShaRoleAppointments_OrganisationPostId").OnTable("Core_ShaRoleAppointments");
            Delete.Column("OrganisationPostId").FromTable("Core_ShaRoleAppointments");

            Delete.ForeignKey("FK_Core_ShaRoleAppointments_OrganisationPostLevelId_Core_OrganisationPostLevels_Id").OnTable("Core_ShaRoleAppointments");
            Delete.Index("IX_Core_ShaRoleAppointments_OrganisationPostLevelId").OnTable("Core_ShaRoleAppointments");
            Delete.Column("OrganisationPostLevelId").FromTable("Core_ShaRoleAppointments");
        }
    }
}
