using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations.Framework
{
    [Migration(20220914135400)]
    public class M20220914135400 : Migration
    {
        public override void Up()
        {
            Execute.Sql(@"
CREATE OR ALTER FUNCTION [dbo].[Frwk_GetMultiValueRefListItemNames]
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
    SELECT @ReferenceListId = Id FROM Frwk_ReferenceLists WHERE [Namespace] = @RefListNamespace AND Name = @RefListName
                            
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

        public override void Down()
        {
            throw new NotImplementedException();
        }

    }
}