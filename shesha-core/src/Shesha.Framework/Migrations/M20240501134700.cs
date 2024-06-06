using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240501134700)]
    public class M20240501134700 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"
insert into Frwk_ConfigurationItems (Id, Description, Name, VersionNo, VersionStatusLkp, ModuleId, ItemType, IsLast, Label, OriginId,
	CreationTime, CreatorUserId, LastModificationTime, LastModifierUserId, IsDeleted, DeletionTime, DeleterUserId)
select Id, Description, Name, 1, 3, (select id from Frwk_Modules where Name = 'Shesha'), 'permission-definition', 1, DisplayName, Id,
	CreationTime, CreatorUserId, LastModificationTime, LastModifierUserId, IsDeleted, DeletionTime, DeleterUserId
from Frwk_PermissionDefinitions
go

ALTER TABLE [dbo].[Frwk_PermissionDefinitions] DROP CONSTRAINT [DF_Frwk_PermissionDefinitions_CreationTime]
GO
ALTER TABLE [dbo].[Frwk_PermissionDefinitions] DROP CONSTRAINT [DF_Frwk_PermissionDefinitions_IsDeleted]
GO
ALTER TABLE [dbo].[Frwk_PermissionDefinitions] DROP CONSTRAINT [FK_Frwk_PermissionDefinitions_CreatorUserId_AbpUsers_Id]
GO
ALTER TABLE [dbo].[Frwk_PermissionDefinitions] DROP CONSTRAINT [FK_Frwk_PermissionDefinitions_DeleterUserId_AbpUsers_Id]
GO
ALTER TABLE [dbo].[Frwk_PermissionDefinitions] DROP CONSTRAINT [FK_Frwk_PermissionDefinitions_LastModifierUserId_AbpUsers_Id]
GO
ALTER TABLE [dbo].[Frwk_PermissionDefinitions] DROP CONSTRAINT [FK_Frwk_PermissionDefinitions_TenantId_AbpTenants_Id]
GO
alter table Frwk_PermissionDefinitions drop column CreationTime;
go
alter table Frwk_PermissionDefinitions drop column CreatorUserId;
go
alter table Frwk_PermissionDefinitions drop column LastModificationTime;
go
alter table Frwk_PermissionDefinitions drop column lastModifierUserId;
go
alter table Frwk_PermissionDefinitions drop column IsDeleted;
go
alter table Frwk_PermissionDefinitions drop column DeleterUserId;
go
alter table Frwk_PermissionDefinitions drop column DeletionTime;
go
alter table Frwk_PermissionDefinitions drop column TenantId;
go

ALTER TABLE [dbo].[Frwk_PermissionDefinitions]  WITH CHECK ADD  CONSTRAINT [FK_Frwk_PermissionDefinitions_Frwk_ConfigurationItems] FOREIGN KEY([Id])
REFERENCES [dbo].[Frwk_ConfigurationItems] ([Id])
GO

ALTER TABLE [dbo].[Frwk_PermissionDefinitions] CHECK CONSTRAINT [FK_Frwk_PermissionDefinitions_Frwk_ConfigurationItems]
GO
");

            IfDatabase("PostgreSql").Execute.Sql(@"
insert into ""Frwk_ConfigurationItems"" (""Id"", ""Description"", ""Name"", ""VersionNo"", ""VersionStatusLkp"", ""ModuleId"",
   ""ItemType"", ""IsLast"", ""Label"", ""OriginId"", ""CreationTime"", ""CreatorUserId"", ""LastModificationTime"", ""LastModifierUserId"",
   ""IsDeleted"", ""DeletionTime"", ""DeleterUserId"")
select ""Id"", ""Description"", ""Name"", 1, 3, (select ""Id"" from ""Frwk_Modules"" where ""Name"" = 'Shesha'), 'permission-definition',
	true, ""DisplayName"", ""Id"", ""CreationTime"", ""CreatorUserId"", ""LastModificationTime"", ""LastModifierUserId"", ""IsDeleted"",
	""DeletionTime"", ""DeleterUserId""
from ""Frwk_PermissionDefinitions"";

ALTER TABLE ""Frwk_PermissionDefinitions"" DROP CONSTRAINT ""FK_Frwk_PermissionDefinitions_CreatorUserId_AbpUsers_Id"";
ALTER TABLE ""Frwk_PermissionDefinitions"" DROP CONSTRAINT ""FK_Frwk_PermissionDefinitions_DeleterUserId_AbpUsers_Id"";
ALTER TABLE ""Frwk_PermissionDefinitions"" DROP CONSTRAINT ""FK_Frwk_PermissionDefinitions_LastModifierUserId_AbpUsers_Id"";
ALTER TABLE ""Frwk_PermissionDefinitions"" DROP CONSTRAINT ""FK_Frwk_PermissionDefinitions_TenantId_AbpTenants_Id"";

alter table ""Frwk_PermissionDefinitions"" drop column ""CreationTime"";
alter table ""Frwk_PermissionDefinitions"" drop column ""CreatorUserId"";
alter table ""Frwk_PermissionDefinitions"" drop column ""LastModificationTime"";
alter table ""Frwk_PermissionDefinitions"" drop column ""LastModifierUserId"";
alter table ""Frwk_PermissionDefinitions"" drop column ""IsDeleted"";
alter table ""Frwk_PermissionDefinitions"" drop column ""DeleterUserId"";
alter table ""Frwk_PermissionDefinitions"" drop column ""DeletionTime"";
alter table ""Frwk_PermissionDefinitions"" drop column ""TenantId"";

ALTER TABLE ""Frwk_PermissionDefinitions"" ADD CONSTRAINT ""FK_Frwk_PermissionDefinitions_Frwk_ConfigurationItems"" FOREIGN KEY(""Id"")
REFERENCES ""Frwk_ConfigurationItems"" (""Id"");
");
        }
    }
}
