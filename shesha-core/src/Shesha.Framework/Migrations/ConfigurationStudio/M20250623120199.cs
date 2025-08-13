using FluentMigrator;
using Shesha.FluentMigrator;
using System.Collections.Generic;

namespace Shesha.Migrations
{
    [Migration(20250623120199)]
    public class M20250623120199 : OneWayMigration
    {
        public override void Up()
        {
            var scripts = new List<string> {
                "00-copy front_end_apps.sql",
                "01-copy modules.sql",
                "02-configuration_items.sql",
                "03-configuration_item_revisions.sql",
                "04_0-entity_configs.sql",
                "04_1-entity_config_revisions.sql",
                "05-form_configuration_revisions.sql",
                "06-notification_channel_revisions.sql",
                "07-permission_definition_revisions.sql",
                "08-reference_list_revisions.sql",
                "09-setting_config_revisions.sql",
                "10-notification_type_revisions.sql",
                "11-role_revisions.sql",
                "12-fill revisions.sql",
                "13-remove old workflow tables.sql",
            };

            foreach (var script in scripts) 
            {
                IfDatabase("SqlServer").Execute.EmbeddedScript($"Shesha.Migrations.ConfigurationStudio.ScriptsMsSql.{script}");
            }
        }
    }
}
