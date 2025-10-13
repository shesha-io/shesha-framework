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

    SELECT config.id INTO ""ReferenceListId"" FROM frwk.configuration_items config
    WHERE config.name = CONCAT(coalesce(CONCAT(""RefListNamespace"" , '.'), '') , ""RefListName"")
    AND config.item_type = 'reference-list'
    AND config.is_deleted = false;

    IF (""RefListItemValue"" IS NULL) THEN
        ""RetVal"" := '';
    ELSE
        SELECT
            string_agg(item, ""Separator"") INTO ""ConcatenatedList""
        FROM
            frwk.reference_list_items
        WHERE
            reference_list_id = ""ReferenceListId""
        AND (item_value & ""RefListItemValue"") > 0
        AND is_deleted = false;

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
