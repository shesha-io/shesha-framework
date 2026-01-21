using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20260120120000)]
    public class M20260120120000 : OneWayMigration
    {
        public override void Up()
        {
            // Transform override_channels data in the existing frwk.notification_types table
            // from double-serialized JSON format to single-serialized JSON format
            // and normalize property casing to match ConfigurationItemIdentifierDto (Name, Module)

            if (Schema.Schema("frwk").Table("notification_types").Exists())
            {
                // ============================================
                // SQL SERVER VERSION
                // ============================================

                // Use OPENJSON to safely parse (handling any escaping) and normalize property names
                // in a single operation. OPENJSON automatically handles double-serialized JSON.
                IfDatabase("SqlServer").Execute.Sql(@"
                    UPDATE frwk.notification_types
                    SET override_channels =
                        (
                            SELECT '[' + STRING_AGG(
                                JSON_MODIFY(
                                    JSON_MODIFY('{}', '$.Module',
                                        COALESCE(
                                            JSON_VALUE(obj.value, '$.module'),
                                            JSON_VALUE(obj.value, '$.Module')
                                        )
                                    ),
                                    '$.Name',
                                    COALESCE(
                                        JSON_VALUE(obj.value, '$.name'),
                                        JSON_VALUE(obj.value, '$.Name')
                                    )
                                ),
                                ','
                            ) + ']'
                            FROM OPENJSON(override_channels) AS obj
                        )
                    WHERE override_channels IS NOT NULL
                        AND override_channels != ''
                        AND override_channels != '[]'
                        AND ISJSON(override_channels) = 1;
                ");

                // ============================================
                // POSTGRESQL VERSION
                // ============================================

                // Use PostgreSQL's built-in JSON functions to safely handle deserialization
                // and normalize property names. jsonb_array_elements automatically handles
                // any escaped JSON when parsing, avoiding unsafe manual string replacement.
                IfDatabase("PostgreSQL").Execute.Sql(@"
                    -- Create a temporary function to safely validate JSON
                    CREATE OR REPLACE FUNCTION pg_temp.is_valid_json(text) RETURNS boolean AS $$
                    BEGIN
                        PERFORM $1::jsonb;
                        RETURN true;
                    EXCEPTION WHEN OTHERS THEN
                        RETURN false;
                    END;
                    $$ LANGUAGE plpgsql IMMUTABLE;

                    UPDATE frwk.notification_types
                    SET override_channels =
                        (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'Module', COALESCE(elem->>'module', elem->>'Module'),
                                    'Name', COALESCE(elem->>'name', elem->>'Name')
                                )
                            )::text
                            FROM jsonb_array_elements(override_channels::jsonb) AS elem
                        )
                    WHERE override_channels IS NOT NULL
                        AND TRIM(override_channels) != ''
                        AND TRIM(override_channels) != '[]'
                        AND pg_temp.is_valid_json(override_channels);
                ");
            }
        }
    }
}