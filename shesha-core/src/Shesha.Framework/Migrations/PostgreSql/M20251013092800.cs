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
CREATE OR REPLACE FUNCTION ""Frwk_GetMultiValueRefListItemNames""
(
    ""RefListNamespace""               varchar(255),
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
    ""ReferenceListId""        uuid;
    ""NullValueName""          varchar(255) = null;    -- The value to return if the item is NULL
    ""Separator""              varchar(20) = null;     -- The characters to place in between each entry
BEGIN
    ""Separator"" := ', ';
    ""NullValueName"" := '';

    SELECT refList.""Id"" INTO ""ReferenceListId"" FROM ""Frwk_ReferenceLists"" refList
    INNER JOIN ""Frwk_ConfigurationItems"" config ON config.""Id"" = refList.""Id""
    WHERE ""Name"" = CONCAT(coalesce(CONCAT(""RefListNamespace"" , '.'), '') , ""RefListName"")
    AND ""ItemType"" = 'reference-list' AND ""VersionStatusLkp"" = 3; /*Live*/

    IF (""RefListItemValue"" IS NULL) THEN
        ""RetVal"" := '';
    ELSE
        SELECT
            string_agg(""Item"", ""Separator"") INTO ""ConcatenatedList""
        FROM
            ""Frwk_ReferenceListItems""
        WHERE
            ""ReferenceListId"" = ""ReferenceListId""
        AND (""ItemValue"" & ""RefListItemValue"") > 0;

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
