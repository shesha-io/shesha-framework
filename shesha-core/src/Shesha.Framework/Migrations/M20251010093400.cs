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
CREATE OR ALTER   FUNCTION [dbo].[Frwk_GetMultiValueRefListItemNames]
(
    @RefListNamespace               varchar(255),
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
            @ReferenceListId        uniqueidentifier,
            @NullValueName          varchar(255) = null,    -- The value to return if the item is NULL 
            @Separator              varchar(20) = null      -- The characters to place in between each entry            
    SET @Separator = ', '
    SET @NullValueName = ''

    SELECT @ReferenceListId = config.id FROM frwk.configuration_items config
	WHERE config.name = CONCAT(coalesce(CONCAT(@RefListNamespace , '.'), '') , @RefListName)
	AND config.item_type = 'reference-list'
	AND config.is_deleted = 0
                            
    IF (@RefListItemValue IS NULL)
        SET @RetVal = ''
    ELSE
    BEGIN
        SELECT
            @ConcatenatedList = COALESCE(@ConcatenatedList + @Separator, '') + item
            FROM
                frwk.reference_list_items
            WHERE
                reference_list_id = @ReferenceListId
            AND (item_value & @RefListItemValue) > 0
            AND is_deleted = 0  
            
        SELECT @RetVal = substring(@ConcatenatedList, LEN(@Separator) + 1, len(@ConcatenatedList))
    END
    

    RETURN @RetVal
END
            ");
        }
    }
}
