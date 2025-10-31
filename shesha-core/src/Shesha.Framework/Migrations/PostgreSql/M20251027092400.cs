using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.PostgreSql
{
    [Migration(20251027092400)]
    public class M20251027092400 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("PostgreSql").Execute.Sql(@"
CREATE OR REPLACE FUNCTION frwk.get_multi_value_ref_list_item_names
(
    ref_list_module_name               varchar(255),
    ref_list_name                      varchar(255),           -- The Id of the Reference List to use for the lookup
    ref_list_item_value                bigint                  -- The Value of the Item to whose name should be returned
)
RETURNS text
AS
$$
/************************************************************************************************
******  TRANSLATES A MULTI-VALUE/BIT MAP REFERENCE LIST VALUE INTO A LIST OF TRANSLATED NAMES ***
************************************************************************************************/
DECLARE
    ret_val                 text;
    concatenated_list       text = '';
    separator               varchar(20) = ', ';     -- The characters to place in between each entry
BEGIN
    IF (ref_list_item_value IS NULL) THEN
        ret_val := '';
    ELSE
        WITH CTE AS (
            SELECT *
            FROM frwk.vw_configuration_items_inheritance
            WHERE name = ref_list_name
                AND module_name = ref_list_module_name
                AND item_type = 'reference-list'
            ORDER BY module_level ASC
            LIMIT 1
        )
        SELECT
            string_agg(ref_item_values.item, separator) INTO concatenated_list
        FROM CTE item_inheritance
        INNER JOIN frwk.vw_reference_list_item_values ref_item_values
            ON item_inheritance.name = ref_item_values.name
            AND item_inheritance.module_name = ref_item_values.module
        WHERE ref_item_values.name = ref_list_name
            AND ref_item_values.module = ref_list_module_name
            AND (ref_item_values.item_value & ref_list_item_value) > 0;

        ret_val := concatenated_list;
    END IF;

    RETURN ret_val;
END;
$$
LANGUAGE plpgsql;
            ");

            IfDatabase("PostgreSql").Execute.Sql(@"
DROP FUNCTION IF EXISTS frwk_get_multi_value_ref_list_item_names(varchar(255), varchar(255), bigint);
            ");
        }
    }
}
