using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20230320170299), MsSqlOnly]
    public class M20230320170299 : OneWayMigration
    {
        public override void Up()
        {
            Execute.Sql(@"if exists (select 1 from Core_NotificationTemplates where NotificationId is null)
begin
	insert into Core_Notifications (Id, Name) values ('F08577F2-6F39-4A1D-9250-5FE188661365', 'Unknown templates');
	update Core_NotificationTemplates set NotificationId = 'F08577F2-6F39-4A1D-9250-5FE188661365' where NotificationId is null;
end
");
            Delete.ForeignKey("FK_Core_NotificationTemplates_NotificationId_Core_Notifications_Id").OnTable("Core_NotificationTemplates");
            Delete.Index("IX_Core_NotificationTemplates_NotificationId").OnTable("Core_NotificationTemplates");

            Alter.Column("NotificationId").OnTable("Core_NotificationTemplates").AsGuid().NotNullable();

            Create.Index("IX_Core_NotificationTemplates_NotificationId").OnTable("Core_NotificationTemplates").OnColumn("NotificationId");
            Create.ForeignKey("FK_Core_NotificationTemplates_NotificationId_Core_Notifications_Id").FromTable("Core_NotificationTemplates")
                .ForeignColumn("NotificationId")
                .ToTable("Core_Notifications")
                .PrimaryColumn("Id");
        }
    }
}
