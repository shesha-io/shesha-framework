using System;
using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20210412160000)]
    public class M20210412160000: Migration
    {
        public override void Up()
        {
            Execute.Sql(@"if EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Frwk_GetRefListItem') AND type in (N'FN', N'IF', N'TF', N'FS', N'FT')) 
	DROP FUNCTION [dbo].[Frwk_GetRefListItem];");

            Execute.Sql(@"CREATE FUNCTION [dbo].[Frwk_GetRefListItem]
(
	@RefListNamespace				varchar(255),
	@RefListName					varchar(255),					-- The Id of the Reference List to use for the lookup
	@RefListItemValue				int								-- The Value of the Item to whose name should be returned
)
RETURNS varchar(255)
AS
BEGIN
	DECLARE @RetVal					varchar(255)

	IF (@RefListItemValue IS NULL)
		SET @RetVal = ''
	ELSE
	BEGIN
		SELECT
			@RetVal = Item
			FROM
				Frwk_ReferenceListItems
			WHERE
				ItemValue = @RefListItemValue
				AND ReferenceListId = (SELECT Id FROM Frwk_ReferenceLists WHERE [Namespace] = @RefListNamespace AND Name = @RefListName)

		IF (@RetVal IS NULL)
			SET @RetVal = 'INVALID';
	END

	RETURN @RetVal
END");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
