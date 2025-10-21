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
CREATE OR REPLACE FUNCTION frwk_get_multi_value_ref_list_item_names
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
    null_value_name         varchar(255) = null;    -- The value to return if the item is NULL
    separator               varchar(20) = null;     -- The characters to place in between each entry
BEGIN
    separator := ', ';
    null_value_name := '';

    IF (ref_list_item_value IS NULL) THEN
        ret_val := '';
    ELSE
        SELECT
            string_agg(item, separator) INTO concatenated_list
        FROM
            frwk.vw_reference_list_item_values ref_item_values
            INNER JOIN frwk.vw_configuration_items_inheritance item_inheritance
            ON item_inheritance.name = ref_list_name
            AND item_inheritance.module_name = ref_list_module_name
            AND item_inheritance.item_type = 'reference-list'
        WHERE
            ref_item_values.module = ref_list_module_name
            AND item_inheritance.module_name = ref_list_module_name
            AND item_inheritance.name = ref_list_name
        AND (ref_item_values.item_value & ref_list_item_value) > 0;

        ret_val := concatenated_list;
    END IF;

    RETURN ret_val;
END;
$$
LANGUAGE plpgsql;
            ");
        }
    }
}
