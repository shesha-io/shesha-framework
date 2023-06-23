using FluentMigrator;

namespace FluentMigrator
{
    /// <summary>
    /// Tag migration that is developed for MS Sql server only
    /// </summary>
    public class MsSqlOnlyAttribute: TagsAttribute
    {
        public MsSqlOnlyAttribute(): base("SQLServer")
        {
            
        }
    }

    /// <summary>
    /// Tag migration that is developed for MS Sql server
    /// </summary>
    public class PostgreSqlOnlyAttribute : TagsAttribute
    {
        public PostgreSqlOnlyAttribute() : base("PostgreSQL")
        {

        }
    }
}
