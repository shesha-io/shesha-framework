using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20250508144200)]
    public class M20250508144200 : AutoReversingMigration
    {
        public override void Up()
        {
            Create.Table("Core_RoleAppointmentTypeConfigs")
                   .WithIdAsGuid()
                   .WithColumn("PermissionedEntity1IsRequiredLkp").AsInt64().Nullable()
                   .WithColumn("PermissionedEntity2IsRequiredLkp").AsInt64().Nullable()
                   .WithColumn("PermissionedEntity3IsRequiredLkp").AsInt64().Nullable();

            Alter.Table("Core_RoleAppointmentTypeConfigs")
                .AddForeignKeyColumn("RoleAppointmentCreateFormId", "Frwk_FormConfigurations")
                .AddForeignKeyColumn("RoleAppointmentDetailsFormId", "Frwk_FormConfigurations")
                .AddForeignKeyColumn("RoleAppointmentListItemFormId", "Frwk_FormConfigurations")
                .AddForeignKeyColumn("PermissionedEntity1TypeId", "Frwk_EntityConfigs")
                .AddForeignKeyColumn("PermissionedEntity2TypeId", "Frwk_EntityConfigs")
                .AddForeignKeyColumn("PermissionedEntity3TypeId", "Frwk_EntityConfigs");

            Alter.Table("Core_ShaRoles")
                .AddForeignKeyColumn("RoleAppointmentTypeId", "Core_RoleAppointmentTypeConfigs");
        }
    }
}
