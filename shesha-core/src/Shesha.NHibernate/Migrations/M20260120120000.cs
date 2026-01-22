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
            // This normalizes the JSON storage without modifying the property names or structure

            if (Schema.Schema("frwk").Table("notification_types").Exists())
            {
                // ============================================
                // SQL SERVER VERSION
                // ============================================

                // Use OPENJSON to safely parse and reconstruct the JSON array
                // OPENJSON automatically handles double-serialized JSON during parsing
                IfDatabase("SqlServer").Execute.Sql(@"
                    UPDATE frwk.notification_types
                    SET override_channels =
                        (
                            SELECT '[' + STRING_AGG(JSON_QUERY(obj.value), ',') + ']'
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
                // jsonb_array_elements automatically handles any escaped JSON when parsing
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
                            SELECT jsonb_agg(elem)::text
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