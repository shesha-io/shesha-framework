using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250825123199)]
    public class M20250825123199 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"CREATE OR ALTER VIEW frwk.vw_configuration_items_tree_nodes AS
WITH folders_cte AS (
    SELECT
        f.id,
        f.module_id AS parent_id,
        f.module_id,
        f.name
    FROM
        frwk.configuration_item_folders f
    WHERE
        f.parent_id IS NULL
        AND f.is_deleted = 0

    UNION ALL

    SELECT
        f.id,
        f.parent_id,
        f.module_id,
        f.name
    FROM
        frwk.configuration_item_folders f
        INNER JOIN folders_cte c ON f.parent_id = c.id
    WHERE
        f.is_deleted = 0
), 
modules_cte AS (
    SELECT
        m.id,
        cast (null as uniqueidentifier) AS parent_id,
        m.id AS module_id,
        cast (m.name as VARCHAR(300)) AS name,
        CAST(m.friendly_name AS VARCHAR(300)) AS label,
        1 AS node_type /*module*/
    FROM
        frwk.modules m
    WHERE
        m.is_deleted = 0
        AND m.is_editable = 1
        AND m.is_enabled = 1

    UNION ALL

    SELECT
        f.id,
        f.parent_id,
        f.module_id,
        cast(f.name as varchar(300)) AS name,
        CAST(f.name AS VARCHAR(300)) AS label,
        3 AS node_type /*folder*/
    FROM
        folders_cte f
        INNER JOIN modules_cte c ON f.module_id = c.id
), 
-- finalCte cannot be recursive because it references modulesCte in non-recursive term
tree_nodes AS (
    SELECT 
        tn.id,
        tn.parent_id,
        tn.module_id,
        tn.name AS name,
        tn.label,
        cast(null as varchar) as description,
        tn.node_type,
        cast(null as varchar(50)) AS item_type,
		0 as is_exposed,
		0 as is_code_based,
		0 as is_updated,
		0 as is_codegen_pending,
		cast(null as bigint) as last_modifier_user_id,
		cast(null as varchar) as last_modifier_user,
		cast(null as datetime) last_modification_time,
		cast(null as varchar) as base_module
    FROM
        modules_cte tn
),
configuration_items as (
    SELECT
        ci.id,
        ci.module_id,
        cast(ci.name as varchar(300)) AS name,
        cast(rev.label as varchar(300)) as label,
		cast(rev.description as varchar) as description,
        2 AS node_type, /*configuration item*/
        ci.item_type,
		ci.is_exposed,
		ci.is_code_based,
		ci.is_updated,
		ci.is_codegen_pending,
		ci.last_modifier_user_id,
		modified_by.""UserName"" as last_modifier_user,
		ci.last_modification_time,
		base_module.name as base_module, 
		ci.folder_id
    FROM
        frwk.configuration_items ci
        inner join frwk.configuration_item_revisions rev on rev.id = ci.latest_revision_id
		left join ""AbpUsers"" modified_by on modified_by.""Id"" = ci.last_modifier_user_id
		left join frwk.configuration_items base_ci on base_ci.id = ci.exposed_from_id
		left join frwk.modules base_module on base_module.id = base_ci.module_id
    WHERE
        ci.is_deleted = 0
),
configuration_items_data AS (
    -- Configuration items with no folder (directly under module)
	SELECT
		ci.id,
		ci.module_id AS parent_id,
		ci.module_id,
		ci.name,
		ci.label,
		ci.description,
		ci.node_type, /*configuration item*/
		ci.item_type,
		ci.is_exposed,
		ci.is_code_based,
		ci.is_updated,
		ci.is_codegen_pending,
		ci.last_modifier_user_id,
		ci.last_modifier_user,
		ci.last_modification_time,
		ci.base_module
	FROM
		configuration_items ci
		INNER JOIN tree_nodes c ON ci.module_id = c.id AND c.node_type = 1 /*module*/
	WHERE
		ci.folder_id IS NULL

    UNION ALL

    -- Configuration items within folders
    SELECT
		ci.id,
		ci.folder_id AS parent_id,
		ci.module_id,
		ci.name,
		ci.label,
		ci.description,
		ci.node_type, /*configuration item*/
		ci.item_type,
		ci.is_exposed,
		ci.is_code_based,
		ci.is_updated,
		ci.is_codegen_pending,
		ci.last_modifier_user_id,
		ci.last_modifier_user,
		ci.last_modification_time,
		ci.base_module
    FROM
        configuration_items ci
        INNER JOIN tree_nodes c ON ci.folder_id = c.id AND c.node_type = 3 /*folder*/
)
-- Combine all the results
SELECT * FROM tree_nodes
UNION ALL
SELECT * FROM configuration_items_data;");

            IfDatabase("PostgreSql").Execute.Sql(@"drop view if exists frwk.vw_configuration_items_tree_nodes");
            IfDatabase("PostgreSql").Execute.Sql(@"CREATE OR REPLACE VIEW frwk.vw_configuration_items_tree_nodes AS
WITH RECURSIVE folders_cte AS (
    SELECT
        f.id,
        f.module_id AS parent_id,
        f.module_id,
        f.name
    FROM
        frwk.configuration_item_folders f
    WHERE
        f.parent_id IS NULL
        AND f.is_deleted = FALSE

    UNION ALL

    SELECT
        f.id,
        f.parent_id,
        f.module_id,
        f.name
    FROM
        frwk.configuration_item_folders f
        INNER JOIN folders_cte c ON f.parent_id = c.id
    WHERE
        f.is_deleted = FALSE
), 
modules_cte AS (
    SELECT
        m.id,
        NULL::uuid AS parent_id,
        m.id AS module_id,
        m.name::VARCHAR(300) AS name,
        CAST(m.friendly_name AS VARCHAR(300)) AS label,
        1 AS node_type /*module*/
    FROM
        frwk.modules m
    WHERE
        m.is_deleted = FALSE
        AND m.is_editable = TRUE
        AND m.is_enabled = TRUE

    UNION ALL

    SELECT
        f.id,
        f.parent_id,
        f.module_id,
        f.name::VARCHAR(300) AS name,
        CAST(f.name AS VARCHAR(300)) AS label,
        3 AS node_type /*folder*/
    FROM
        folders_cte f
        INNER JOIN modules_cte c ON f.module_id = c.id
), 
-- finalCte cannot be recursive because it references modulesCte in non-recursive term
tree_nodes AS (
    SELECT 
        tn.id,
        tn.parent_id,
        tn.module_id,
        tn.name AS name,
        tn.label,
        null::varchar as description,
        tn.node_type,
        NULL::VARCHAR(50) AS item_type,
		false as is_exposed,
		false as is_code_based,
		false as is_updated,
		false as is_codegen_pending,
		null::bigint as last_modifier_user_id,
		null::varchar as last_modifier_user,
		null::timestamp last_modification_time,
		null::varchar as base_module
    FROM
        modules_cte tn
),
configuration_items as (
    SELECT
        ci.id,
        ci.module_id,
        cast(ci.name as varchar(300)) AS name,
        cast(rev.label as varchar(300)) as label,
		cast(rev.description as varchar) as description,
        2 AS node_type, /*configuration item*/
        ci.item_type,
		ci.is_exposed,
		ci.is_code_based,
		ci.is_updated,
		ci.is_codegen_pending,
		ci.last_modifier_user_id,
		modified_by.""UserName"" as last_modifier_user,
		ci.last_modification_time,
		base_module.name as base_module, 
		ci.folder_id
    FROM
        frwk.configuration_items ci
        inner join frwk.configuration_item_revisions rev on rev.id = ci.latest_revision_id
		left join ""AbpUsers"" modified_by on modified_by.""Id"" = ci.last_modifier_user_id
		left join frwk.configuration_items base_ci on base_ci.id = ci.exposed_from_id
		left join frwk.modules base_module on base_module.id = base_ci.module_id
    WHERE
        ci.is_deleted = false
),
configuration_items_data AS (
    -- Configuration items with no folder (directly under module)
    SELECT
		ci.id,
		ci.module_id AS parent_id,
		ci.module_id,
		ci.name,
		ci.label,
		ci.description,
		ci.node_type, /*configuration item*/
		ci.item_type,
		ci.is_exposed,
		ci.is_code_based,
		ci.is_updated,
		ci.is_codegen_pending,
		ci.last_modifier_user_id,
		ci.last_modifier_user,
		ci.last_modification_time,
		ci.base_module
    FROM
        configuration_items ci
        INNER JOIN tree_nodes c ON ci.module_id = c.id AND c.node_type = 1 /*module*/
    WHERE
        ci.folder_id IS NULL

    UNION ALL

    -- Configuration items within folders
    SELECT
		ci.id,
		ci.folder_id AS parent_id,
		ci.module_id,
		ci.name,
		ci.label,
		ci.description,
		ci.node_type, /*configuration item*/
		ci.item_type,
		ci.is_exposed,
		ci.is_code_based,
		ci.is_updated,
		ci.is_codegen_pending,
		ci.last_modifier_user_id,
		ci.last_modifier_user,
		ci.last_modification_time,
		ci.base_module
    FROM
        configuration_items ci
        INNER JOIN tree_nodes c ON ci.folder_id = c.id AND c.node_type = 3 /*folder*/
)
-- Combine all the results
SELECT * FROM tree_nodes
UNION ALL
SELECT * FROM configuration_items_data;");
        }
    }
}
