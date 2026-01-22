using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20260121101699)]
    public class M20260121101699 : OneWayMigration
    {
        public override void Up()
        {
            if (Schema.Table("Core_NotificationTemplates").Exists()) 
            {
                this.Shesha().MoveForeignKeys("Core_NotificationTemplates", null, "Id", "notification_templates", "frwk", "id");
                Delete.Table("Core_NotificationTemplates");
            }                
        }
    }
}
