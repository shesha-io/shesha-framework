﻿using FluentMigrator;
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
RETURNS varchar(255)
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

    SELECT @ReferenceListId = refList.Id FROM Frwk_ReferenceLists refList
	INNER JOIN Frwk_ConfigurationItems config ON config.Id = refList.Id
	WHERE Name = CONCAT(coalesce(CONCAT(@RefListNamespace , '.'), '') , @RefListName)
	AND ItemType = 'reference-list' AND VersionStatusLkp = 3 /*Live*/
                            
    IF (@RefListItemValue IS NULL)
        SET @RetVal = ''
    ELSE
    BEGIN
        SELECT
            @ConcatenatedList = COALESCE(@ConcatenatedList + @Separator, '') + Item
            FROM 
                Frwk_ReferenceListItems
            WHERE
                ReferenceListId = @ReferenceListId
            AND (ItemValue & @RefListItemValue) > 0  
            
        SELECT @RetVal = substring(@ConcatenatedList, LEN(@Separator) + 1, len(@ConcatenatedList))
    END
    

    RETURN @RetVal
END
            ");
        }
    }
}
