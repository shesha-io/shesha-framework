using FluentMigrator;
using Shesha.FluentMigrator;
using System.Collections.Generic;

namespace Shesha.Migrations
{
    [Migration(20261015124799)]
    public class M20261015124799 : OneWayMigration
    {
        public override void Up()
        {
            var newNames = new Dictionary<string, string>{
                { "app:Configurator", "Application-Configure" },
                { "pages:applicationSettings", "Application-Settings" },
                { "pages:maintenance", "Application-Maintenance" },
                { "Pages.Hangfire", "Hangfire-Dashboard" },
                { "Pages.Users", "User-Manage" },
                { "users:resetPassword", "User-ResetPassword" },
                { "Pages.Roles", "Role-Manage" },
                { "pages:shaRoles", "Role-Manage" },                
                { "pages:persons", "Person-View" },                
            };
            foreach (var (oldName, newName) in newNames)
            {
                RenamePermission(oldName, newName);
            }
        }

        private void RenamePermission(string oldName, string newName)
        {
            Execute.Sql($@"update 
	""Frwk_PermissionedObjects"" 
set 
	""Permissions"" = replace(""Permissions"", '{oldName}', '{newName}') 
where 
	""Permissions"" is not null 
	and ""Permissions"" like '%{oldName}%'");
        }        
    }
}
