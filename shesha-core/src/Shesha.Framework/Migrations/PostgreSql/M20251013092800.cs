using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.PostgreSql
{
    [Migration(20251013092800)]
    public class M20251013092800 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("PostgreSql").Execute.Sql(@"
CREATE OR REPLACE FUNCTION ""frwk_get_multi_value_ref_list_item_names""
(
    ""RefListModuleName""               varchar(255),
    ""RefListName""                    varchar(255),           -- The Id of the Reference List to use for the lookup
    ""RefListItemValue""               bigint                  -- The Value of the Item to whose name should be returned
)
RETURNS text
AS
$$
/************************************************************************************************
******  TRANSLATES A MULTI-VALUE/BIT MAP REFERENCE LIST VALUE INTO A LIST OF TRANSLATED NAMES ***
************************************************************************************************/
DECLARE
    ""RetVal""                 text;
    ""ConcatenatedList""       text = '';
    ""NullValueName""          varchar(255) = null;    -- The value to return if the item is NULL
    ""Separator""              varchar(20) = null;     -- The characters to place in between each entry
BEGIN
    ""Separator"" := ', ';
    ""NullValueName"" := '';

    IF (""RefListItemValue"" IS NULL) THEN
        ""RetVal"" := '';
    ELSE
        SELECT
            string_agg(item, ""Separator"") INTO ""ConcatenatedList""
        FROM
            frwk.vw_reference_list_item_values refItemValues
            INNER JOIN frwk.vw_configuration_items_inheritance itemInheritance
            ON refItemValues.name = itemInheritance.name AND refItemValues.module = itemInheritance.module_name
        WHERE
            module = ""RefListModuleName""
            AND itemInheritance.module_name = ""RefListModuleName""
            AND itemInheritance.name = ""RefListName""
        AND (item_value & ""RefListItemValue"") > 0;

        ""RetVal"" := ""ConcatenatedList"";
    END IF;

    RETURN ""RetVal"";
END;
$$
LANGUAGE plpgsql;
            ");
        }
    }
}
