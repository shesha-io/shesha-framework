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
    @RefListModuleName               varchar(255),
    @RefListName                    varchar(255),           -- The Id of the Reference List to use for the lookup
    @RefListItemValue               bigint                     -- The Value of the Item to whose name should be returned
)
RETURNS varchar(MAX)
AS
BEGIN
    /************************************************************************************************
    ******  TRANSLATES A MULTI-VALUE/BIT MAP REFERENCE LIST VALUE INTO A LIST OF TRANSLATED NAMES ***
    ************************************************************************************************/
    DECLARE @RetVal                 varchar(max),
            @ConcatenatedList       varchar(max) = '',
            @NullValueName          varchar(255) = null,    -- The value to return if the item is NULL 
            @Separator              varchar(20) = null      -- The characters to place in between each entry        
    SET @Separator = ', '
    SET @NullValueName = ''
                            
    IF (@RefListItemValue IS NULL)
        SET @RetVal = ''
    ELSE
    BEGIN
        SELECT
            @ConcatenatedList = COALESCE(@ConcatenatedList + @Separator, '') + item
            FROM
                [frwk].[vw_reference_list_item_values] refItemValues
				INNER JOIN [frwk].[vw_configuration_items_inheritance] itemInheritance 
				ON refItemValues.name = itemInheritance.name AND refItemValues.module = itemInheritance.module_name
            WHERE
                module = @RefListModuleName
				AND itemInheritance.module_name = @RefListModuleName
				AND itemInheritance.name = @RefListName
            AND (item_value & @RefListItemValue) > 0  
            
        SELECT @RetVal = substring(@ConcatenatedList, LEN(@Separator) + 1, len(@ConcatenatedList))
    END
    

    RETURN @RetVal
END
            ");
        }
    }
}
