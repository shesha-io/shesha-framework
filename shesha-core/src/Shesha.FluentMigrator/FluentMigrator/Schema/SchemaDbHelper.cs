using FluentMigrator;
using System.Data;

namespace Shesha.FluentMigrator.Modules
{
    internal class SchemaDbHelper : DbHelperBase
    {
        public SchemaDbHelper(DbmsType dbmsType, IDbConnection connection, IDbTransaction transaction, IQuerySchema querySchema) : base(dbmsType, connection, transaction, querySchema)
        {
        }

        public void MoveForeignKeys(string oldTable, string? oldSchema, string oldColumn, string newTable, string? newSchema, string newColumn)
        {
            var keys = RetrieveDependedKeys(oldSchema, oldTable, oldColumn);
            if (!keys.Any())
                return;

            var currentSchema = GetSchemaName();

            foreach (var key in keys) 
            {
                DropFk(key.ForeignSchema, key.ForeignTable, key.ForeignKeyName);

                CreateFk(key, newSchema ?? currentSchema, newTable, newColumn);
            }
        }

        private string GetSchemaName() 
        {
            var sql = DbmsType switch
            {
                DbmsType.SQLServer => "SELECT SCHEMA_NAME()",
                DbmsType.PostgreSQL => "SELECT current_schema()",
                _ => throw new NotSupportedException($"{DbmsType} is not supported")
            };
            return ExecuteScalar<string>(sql) ?? throw new Exception("Unable to get schema name");
        }

        private void DropFk(string schema, string table, string fkName)
        {
            var sql = DbmsType switch
            {
                DbmsType.SQLServer => $@"ALTER TABLE [{schema}].[{table}] DROP CONSTRAINT [{fkName}];",
                DbmsType.PostgreSQL => $@"ALTER TABLE ""{schema}"".""{table}"" DROP CONSTRAINT ""{fkName}"";",
                _ => throw new NotSupportedException($"{DbmsType} is not supported")
            };
            
            ExecuteNonQuery(sql);            
        }

        private void CreateFk(ConstraintInfo key, string primarySchema, string primaryTable, string primaryColumn)
        {
            var sql = DbmsType switch
            {
                DbmsType.SQLServer => $@"ALTER TABLE [{key.ForeignSchema}].[{key.ForeignTable}] 
ADD CONSTRAINT [{key.ForeignKeyName}]
FOREIGN KEY ([{key.ForeignColumn}]) 
REFERENCES [{primarySchema}].[{primaryTable}] ([{primaryColumn}])
ON UPDATE {key.UpdateRule} 
ON DELETE {key.DeleteRule};",
                DbmsType.PostgreSQL => $@"ALTER TABLE ""{key.ForeignSchema}"".""{key.ForeignTable}"" 
ADD CONSTRAINT ""{key.ForeignKeyName}""
FOREIGN KEY (""{key.ForeignColumn}"") 
REFERENCES ""{primarySchema}"".""{primaryTable}"" (""{primaryColumn}"")
ON UPDATE {key.UpdateRule} 
ON DELETE {key.DeleteRule};",
                _ => throw new NotSupportedException($"{DbmsType} is not supported")
            };

            ExecuteNonQuery(sql);
        }

        private IEnumerable<ConstraintInfo> RetrieveDependedKeys(string? oldSchema, string oldTable, string oldColumn)
        {
            var sql = DbmsType switch
            {
                DbmsType.SQLServer => @"SELECT 
    fk.name AS foreign_key_name,
    fc.name AS foreign_column,
    ft.name AS foreign_table,
    SCHEMA_NAME(ft.schema_id) AS foreign_schema,
    --fk.update_referential_action_desc AS update_rule,
    --fk.delete_referential_action_desc AS delete_rule
    -- Convert update action to CONSTRAINT syntax
    CASE fk.update_referential_action_desc
        WHEN 'NO_ACTION' THEN 'NO ACTION'
        WHEN 'CASCADE' THEN 'CASCADE'
        WHEN 'SET_NULL' THEN 'SET NULL'
        WHEN 'SET_DEFAULT' THEN 'SET DEFAULT'
        ELSE 'NO ACTION'
    END AS update_action_syntax,
    -- Convert delete action to CONSTRAINT syntax
    CASE fk.delete_referential_action_desc
        WHEN 'NO_ACTION' THEN 'NO ACTION'
        WHEN 'CASCADE' THEN 'CASCADE'
        WHEN 'SET_NULL' THEN 'SET NULL'
        WHEN 'SET_DEFAULT' THEN 'SET DEFAULT'
        ELSE 'NO ACTION'
    END AS delete_action_syntax
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc 
    ON fk.object_id = fkc.constraint_object_id
INNER JOIN sys.tables pt 
    ON fk.referenced_object_id = pt.object_id
INNER JOIN sys.tables ft 
    ON fk.parent_object_id = ft.object_id
INNER JOIN sys.columns pc 
    ON fkc.referenced_object_id = pc.object_id 
    AND fkc.referenced_column_id = pc.column_id
INNER JOIN sys.columns fc 
    ON fkc.parent_object_id = fc.object_id 
    AND fkc.parent_column_id = fc.column_id
where
	pc.name = @primary_column
    and pt.name = @primary_table
    and SCHEMA_NAME(pt.schema_id) = coalesce(@primary_schema, SCHEMA_NAME())
ORDER BY foreign_schema, foreign_table, foreign_key_name
",
                DbmsType.PostgreSQL => @"SELECT 
    con.conname AS foreign_key_name,
    att.attname AS foreign_column,
    cl2.relname AS foreign_table,
    nsp2.nspname AS foreign_schema,
    CASE con.confupdtype 
        WHEN 'a' THEN 'NO ACTION' 
        WHEN 'r' THEN 'RESTRICT' 
        WHEN 'c' THEN 'CASCADE' 
        WHEN 'n' THEN 'SET NULL' 
        WHEN 'd' THEN 'SET DEFAULT' 
    END AS update_rule,
    CASE con.confdeltype 
        WHEN 'a' THEN 'NO ACTION' 
        WHEN 'r' THEN 'RESTRICT' 
        WHEN 'c' THEN 'CASCADE' 
        WHEN 'n' THEN 'SET NULL' 
        WHEN 'd' THEN 'SET DEFAULT' 
    END AS delete_rule
FROM pg_constraint con
INNER JOIN pg_class cl ON con.confrelid = cl.oid
INNER JOIN pg_class cl2 ON con.conrelid = cl2.oid
INNER JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY(con.conkey)
INNER JOIN pg_attribute att2 ON att2.attrelid = con.confrelid AND att2.attnum = ANY(con.confkey)
INNER JOIN pg_namespace nsp ON cl.relnamespace = nsp.oid
INNER JOIN pg_namespace nsp2 ON cl2.relnamespace = nsp2.oid
WHERE con.contype = 'f'
	and att2.attname /*primary_column*/ = @primary_column
	and cl.relname /*primary_table*/ = @primary_table
	and nsp.nspname /*primary_schema*/ = coalesce(@primary_schema, current_schema())
ORDER BY foreign_schema, foreign_table, foreign_key_name",
                _ => throw new NotSupportedException($"{DbmsType} is not supported")
            };

            var keys = new List<ConstraintInfo>();

            ExecuteCommand(sql, cmd => {
                cmd.AddParameter("primary_schema", oldSchema);
                cmd.AddParameter("primary_table", oldTable);
                cmd.AddParameter("primary_column", oldColumn);

                using (var reader = cmd.ExecuteReader()) 
                {
                    while (reader.Read())
                    {
                        var key = new ConstraintInfo
                        {
                            ForeignKeyName = reader.GetString(0),
                            ForeignColumn = reader.GetString(1),
                            ForeignTable = reader.GetString(2),
                            ForeignSchema = reader.GetString(3),
                            UpdateRule = reader.GetString(4),
                            DeleteRule = reader.GetString(5),
                        };
                        keys.Add(key);
                    }
                    reader.Close();
                }
            });

            return keys;
        }

        private class ConstraintInfo
        {
            public string ForeignKeyName { get; set; }
            public string ForeignSchema { get; set; }
            public string ForeignTable { get; set; }
            public string ForeignColumn { get; set; }
            public string UpdateRule { get; set; }
            public string DeleteRule { get; set; }
        }
    }
}
