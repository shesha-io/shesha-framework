using FluentMigrator;
using Shesha.FluentMigrator;
using Shesha.Utilities;
using System.Linq;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20260202111799)]
    public class M20260202111799 : OneWayMigration
    {
        public override void Up()
        {
			var formsToKeep = new[] {
				"header",
				"audit-logs",
				"entity-change-audit-log",
				"entity-change-audit-log-datalist",
				"logon-attempt",
				"notification-message",
				"notification-template-create",
				"reference-list-item-create",
				"reference-list-item-edit",
				"role-assign-user",
				"user-create",
				"users",
				"blank-view",
				"blank-view-extension-json",
				"create-view",
				"create-view-extension-json",
				"cs-entity-create",
				"cs-expose-existing",
				"cs-folder-create",
				"cs-folder-rename",
				"cs-form-create",
				"cs-item-rename",
				"cs-notification-channel-editor",
				"cs-notification-type-create",
				"cs-notification-type-editor",
				"cs-reflist-create",
				"cs-reflist-editor",
				"cs-revision-rename",
				"cs-role-create",
				"cs-role-editor",
				"details-view",
				"details-view-extension-json",
				"footer-public-portal",
				"forgot-password",
				"form-template-create",
				"form-template-details",
				"form-templates",
				"front-end-application-create",
				"front-end-application-details",
				"front-end-applications",
				"header-public-portal",
				"login",
				"login-public-portal",
				"logon-audit",
				"main-menu-settings",
				"modules",
				"notifications-audit",
				"otp-audit",
				"otp-audit-details",
				"otp-verification",
				"otp-verification-page",
				"reset-password",
				"reset-password-options-error",
				"security-settings",
				"table-view",
				"table-view-extension-json",
				"theme-settings",
				"user-add-to-role",
				"user-details",
				"user-management-settings" 
			};
			var namesRange = formsToKeep.Select(n => $"'{n}'").Delimited(",");

            IfDatabase("SqlServer").Execute.Sql($@"update
	ci
set
	exposed_from_id = null
from 
	frwk.configuration_items ci
	inner join frwk.configuration_items base_ci on base_ci.id = ci.exposed_from_id
	inner join frwk.modules base_m on base_m.id = base_ci.module_id and base_m.name = 'Shesha'
where 
	ci.item_type = 'form'
	and ci.name not in ({namesRange})
go
update
	ci
set
	exposed_from_revision_id = null
from 
	frwk.configuration_items ci
	inner join frwk.configuration_item_revisions base_rev on base_rev.id = ci.exposed_from_revision_id
	inner join frwk.configuration_items base_ci on base_ci.id = base_rev.configuration_item_id
	inner join frwk.modules base_m on base_m.id = base_ci.module_id and base_m.name = 'Shesha'
where 
	ci.item_type = 'form'
	and ci.name not in ({namesRange})
go
update
	frwk.form_configurations
set
	template_id = null
where
	template_id in (
		select 
			ci.id 
		from 
			frwk.configuration_items ci
			inner join frwk.modules m on m.id = ci.module_id
		where 
			ci.item_type = 'form'
			and m.name = 'Shesha'
			and ci.name not in ({namesRange})
	)
go
update frwk.configuration_items 
set
	latest_imported_revision_id = null,
	latest_revision_id = null
where 
	id in (
		select 
			ci.id 
		from 
			frwk.configuration_items ci
			inner join frwk.modules m on m.id = ci.module_id
		where
			m.name = 'Shesha'	
			and ci.item_type = 'form'
			and ci.name not in ({namesRange})
	)
go
update frwk.configuration_item_revisions 
set
	parent_revision_id = null
where 
	configuration_item_id in (
	select 
		ci.id 
	from 
		frwk.configuration_items ci
		inner join frwk.modules m on m.id = ci.module_id
	where
		m.name = 'Shesha'	
		and ci.item_type = 'form'
		and ci.name not in ({namesRange})
)
go
update
	rev
set
	parent_revision_id = null
from 
	frwk.configuration_items ci
	inner join frwk.modules m on m.id = ci.module_id
	inner join frwk.configuration_item_revisions rev on rev.configuration_item_id = ci.id
	inner join frwk.configuration_item_revisions p_rev on p_rev.id = rev.parent_revision_id
	inner join frwk.configuration_items base_ci on base_ci.id = p_rev.configuration_item_id
	inner join frwk.modules base_m on base_m.id = base_ci.module_id and base_m.name = 'Shesha'
where 
	ci.item_type = 'form'
	and m.name = 'Shesha' 
	and ci.name <> base_ci.name
go
delete from frwk.configuration_item_revisions where configuration_item_id in (
	select 
		ci.id 
	from 
		frwk.configuration_items ci
		inner join frwk.modules m on m.id = ci.module_id
	where
		m.name = 'Shesha'	
		and ci.item_type = 'form'
		and ci.name not in ({namesRange})
)
go
delete from frwk.form_configurations where id in (
	select 
		ci.id 
	from 
		frwk.configuration_items ci
		inner join frwk.modules m on m.id = ci.module_id
	where
		m.name = 'Shesha'
		and ci.item_type = 'form'
		and ci.name not in ({namesRange})
)
go
delete from frwk.configuration_items where id in (
	select 
		ci.id 
	from 
		frwk.configuration_items ci
		inner join frwk.modules m on m.id = ci.module_id
	where
		m.name = 'Shesha'
		and ci.item_type = 'form'
		and ci.name not in ({namesRange})
)");
        }
    }
}
