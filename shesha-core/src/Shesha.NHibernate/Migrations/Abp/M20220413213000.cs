using System;
using FluentMigrator;

namespace Shesha.Migrations.Abp
{
    [Migration(20220413213000)]
    public class M20220413213000 : Migration
    {
        public override void Up()
        {
            // increase size because some Entities Audit stored Name as an entity id (eg Setting)
            Execute.Sql(@"
DROP INDEX [IX_AbpEntityChanges_EntityTypeFullName_EntityId] ON [dbo].[AbpEntityChanges]
GO

ALTER TABLE [dbo].[AbpEntityChanges] ALTER COLUMN [EntityId] NVARCHAR(512)
GO

CREATE NONCLUSTERED INDEX [IX_AbpEntityChanges_EntityTypeFullName_EntityId] ON [dbo].[AbpEntityChanges]
(
	[EntityTypeFullName] ASC,
	[EntityId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
