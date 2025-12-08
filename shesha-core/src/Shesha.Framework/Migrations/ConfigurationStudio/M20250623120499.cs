using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250623120499)]
    public class M20250623120499 : OneWayMigration
    {
        public override void Up()
        {
            Execute.Sql(@"drop view if exists ""vw_Frwk_PermissionedObjectsFull""");

            if (Schema.Table("Core_FormConfigurations").Exists())
                Delete.Table("Core_FormConfigurations");

            Delete.Table("Core_ShaRoleAppointments");
            Delete.Table("Core_ShaRolePermissions");

            IfDatabase("SqlServer").Execute.Sql(@"IF (OBJECT_ID('dbo.FK_rpt_reportingReports_VisibilityRoleId_Core_ShaRoles_Id', 'F') IS NOT NULL)
	ALTER TABLE rpt_reportingReports DROP CONSTRAINT FK_rpt_reportingReports_VisibilityRoleId_Core_ShaRoles_Id;");

            IfDatabase("SqlServer").Execute.Sql(@"IF (OBJECT_ID('dbo.FK_Core_DistributionListItems_ShaRoleId_Core_ShaRoles_Id', 'F') IS NOT NULL)
	ALTER TABLE entpr_DistributionListItems DROP CONSTRAINT FK_Core_DistributionListItems_ShaRoleId_Core_ShaRoles_Id;");

            this.Shesha().MoveForeignKeys("Core_ShaRoles", null, "Id", "role_revisions", "frwk", "id");
            this.Shesha().MoveForeignKeys("Frwk_ConfigurationItems", null, "Id", "configuration_item_revisions", "frwk", "id");
            this.Shesha().MoveForeignKeys("Frwk_Modules", null, "Id", "modules", "frwk", "id");

            Delete.Table("Core_ShaRoles");
            Delete.Table("Frwk_ConfigurationItems");
            Delete.Table("Frwk_Modules");

            IfDatabase("SqlServer").Execute.Sql(@"IF (OBJECT_ID('dbo.FK_entpr_HomeUrlRoutes_AppId_Frwk_FrontEndApps_Id', 'F') IS NOT NULL)
	ALTER TABLE entpr_HomeUrlRoutes DROP CONSTRAINT FK_entpr_HomeUrlRoutes_AppId_Frwk_FrontEndApps_Id;");

            this.Shesha().MoveForeignKeys("Frwk_FrontEndApps", null, "Id", "front_end_apps", "frwk", "id");
            Delete.Table("Frwk_FrontEndApps");

            // Shesha.Domain.PermissionedObject
            Create.Table("permissioned_objects").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithFullAuditColumns(SnakeCaseDbObjectNames.Instance)
                .WithColumn("access_lkp").AsInt64()
                .WithColumn("category").AsString(1000).Nullable()
                .WithColumn("description").AsString(1000).Nullable()
                .WithColumn("hardcoded").AsBoolean().Nullable()
                .WithColumn("hidden").AsBoolean()
                .WithColumn("md5").AsString(40)
                .WithColumn("name").AsString(1000).Nullable()
                .WithColumn("object").AsString(1000)
                .WithColumn("parent").AsString(1000)
                .WithColumn("permissions").AsString(1000).Nullable()
                .WithColumn("type").AsString(1000).Nullable();

            Create.Index("ix_frwk_permissioned_objects_object").OnTable("permissioned_objects").InSchema("frwk").OnColumn("object");
            Create.Index("ix_frwk_permissioned_objects_parent").OnTable("permissioned_objects").InSchema("frwk").OnColumn("parent");

            // Shesha.Domain.PermissionedObject
            Alter.Table("permissioned_objects").InSchema("frwk")
                .AddColumn("module_id").AsGuid().Nullable().ForeignKey("fk_permissioned_objects_module_id", "frwk", "modules", "id").Indexed();

            ExecuteCsScript("20-copy permissioned_objects.sql");

            Delete.Table("Frwk_PermissionedObjects");            
        }

        private void ExecuteCsScript(string script)
        {
            IfDatabase("SqlServer").Execute.EmbeddedScript($"Shesha.Migrations.ConfigurationStudio.ScriptsMsSql.{script}");
            IfDatabase("PostgreSql").Execute.EmbeddedScript($"Shesha.Migrations.ConfigurationStudio.ScriptsPostgreSql.{script}");
        }
    }
}
