using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations.EnterpriseMigration
{
    [Migration(20220722094199)]
    public class M20220722094199 : Migration
    {
        public override void Down()
        {
            throw new NotImplementedException();
        }

        public override void Up()
        {
            Execute.Sql(
@"if EXISTS (SELECT 1 FROM sysobjects WHERE id = OBJECT_ID(N'[vw_core_ShaRoleAppointedPersons]')) 
	drop view vw_core_ShaRoleAppointedPersons");

            // Shesha.Domain.ConfigurationItems.ConfigurationItem
            Create.Table("Frwk_ConfigurationItems")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("Description").AsStringMax().Nullable()
                .WithColumn("Name").AsString(200).Nullable()
                .WithColumn("VersionNo").AsInt32()
                .WithColumn("VersionStatusLkp").AsInt64();

            // Shesha.Domain.ConfigurationItems.Module
            Create.Table("Frwk_Modules")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("Description").AsStringMax().Nullable()
                .WithColumn("IsEnabled").AsBoolean()
                .WithColumn("Name").AsString(200).Nullable();

            // Shesha.Domain.ConfigurationItems.ConfigurationItem
            Alter.Table("Frwk_ConfigurationItems")
                .AddForeignKeyColumn("BaseItemId", "Frwk_ConfigurationItems")
                .AddForeignKeyColumn("CreatedByImportId", "Frwk_ImportResults")
                .AddForeignKeyColumn("ModuleId", "Frwk_Modules")
                .AddForeignKeyColumn("ParentVersionId", "Frwk_ConfigurationItems");
        }
    }
}
