using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20251010093400)]
    public class M20251010093400 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"
CREATE OR ALTER   FUNCTION [dbo].[frwk_get_multi_value_ref_list_item_names]
(
    @ref_list_module_name               varchar(255),
    @ref_list_name                      varchar(255),           -- The Id of the Reference List to use for the lookup
    @ref_list_item_value                bigint                  -- The Value of the Item to whose name should be returned
)
RETURNS varchar(MAX)
AS
BEGIN
    /************************************************************************************************
    ******  TRANSLATES A MULTI-VALUE/BIT MAP REFERENCE LIST VALUE INTO A LIST OF TRANSLATED NAMES ***
    ************************************************************************************************/
    DECLARE @ret_val                    varchar(max),
            @concatenated_list          varchar(max) = '',
            @null_value_name            varchar(255) = null,    -- The value to return if the item is NULL
            @separator                  varchar(20) = null      -- The characters to place in between each entry
    SET @separator = ', '
    SET @null_value_name = ''

    IF (@ref_list_item_value IS NULL)
        SET @ret_val = ''
    ELSE
    BEGIN
        SELECT
            @concatenated_list = COALESCE(@concatenated_list + @separator, '') + ref_item_values.item
            FROM
                [frwk].[vw_reference_list_item_values] ref_item_values
			INNER JOIN [frwk].[vw_configuration_items_inheritance] item_inheritance
			ON item_inheritance.name = @ref_list_name
			AND item_inheritance.module_name = @ref_list_module_name
			AND item_inheritance.item_type = 'reference-list'
            WHERE
                ref_item_values.module = @ref_list_module_name
			AND item_inheritance.module_name = @ref_list_module_name
			AND item_inheritance.name = @ref_list_name
            AND (ref_item_values.item_value & @ref_list_item_value) > 0

        SELECT @ret_val = substring(@concatenated_list, LEN(@separator) + 1, len(@concatenated_list))
    END


    RETURN @ret_val
END
            ");
        }
    }
}
