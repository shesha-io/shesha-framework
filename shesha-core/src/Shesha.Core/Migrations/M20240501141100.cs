using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240501141100)]
    public class M20240501141100 : OneWayMigration
    {
        public override void Up()
        {

            Execute.Sql(@"
insert into Frwk_ConfigurationItems (Id, Description, Name, VersionNo, VersionStatusLkp, ModuleId, ItemType, IsLast, Label, OriginId,
	CreationTime, CreatorUserId, LastModificationTime, LastModifierUserId, IsDeleted, DeletionTime, DeleterUserId)
select Id, Description, Name, 1, 3, (select id from Frwk_Modules where Name = 'Shesha'), 'shesha-role', 1, Name, Id,
	CreationTime, CreatorUserId, LastModificationTime, LastModifierUserId, IsDeleted, DeletionTime, DeleterUserId
from Core_ShaRoles
go

DROP INDEX [IX_Core_ShaRoles_CreatorUserId] ON [dbo].[Core_ShaRoles]
GO
DROP INDEX [IX_Core_ShaRoles_DeleterUserId] ON [dbo].[Core_ShaRoles]
GO
DROP INDEX [IX_Core_ShaRoles_LastModifierUserId] ON [dbo].[Core_ShaRoles]
GO
DROP INDEX [IX_Core_ShaRoles_TenantId] ON [dbo].[Core_ShaRoles]
GO

ALTER TABLE [dbo].[Core_ShaRoles] DROP CONSTRAINT [DF_Core_ShaRoles_CreationTime]
GO
ALTER TABLE [dbo].[Core_ShaRoles] DROP CONSTRAINT [DF_Core_ShaRoles_IsDeleted]
GO
ALTER TABLE [dbo].[Core_ShaRoles] DROP CONSTRAINT [FK_Core_ShaRoles_CreatorUserId_AbpUsers_Id]
GO
ALTER TABLE [dbo].[Core_ShaRoles] DROP CONSTRAINT [FK_Core_ShaRoles_DeleterUserId_AbpUsers_Id]
GO
ALTER TABLE [dbo].[Core_ShaRoles] DROP CONSTRAINT [FK_Core_ShaRoles_LastModifierUserId_AbpUsers_Id]
GO
ALTER TABLE [dbo].[Core_ShaRoles] DROP CONSTRAINT [FK_Core_ShaRoles_TenantId_AbpTenants_Id]
GO
alter table Core_ShaRoles drop column CreationTime;
go
alter table Core_ShaRoles drop column CreatorUserId;
go
alter table Core_ShaRoles drop column LastModificationTime;
go
alter table Core_ShaRoles drop column lastModifierUserId;
go
alter table Core_ShaRoles drop column IsDeleted;
go
alter table Core_ShaRoles drop column DeleterUserId;
go
alter table Core_ShaRoles drop column DeletionTime;
go
alter table Core_ShaRoles drop column TenantId;
go

ALTER TABLE [dbo].[Core_ShaRoles]  WITH CHECK ADD  CONSTRAINT [FK_Core_ShaRoles_Frwk_ConfigurationItems] FOREIGN KEY([Id])
REFERENCES [dbo].[Frwk_ConfigurationItems] ([Id])
GO
ALTER TABLE [dbo].[Core_ShaRoles] CHECK CONSTRAINT [FK_Core_ShaRoles_Frwk_ConfigurationItems]
GO
");
        }
    }
}
