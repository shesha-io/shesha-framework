using NHibernate.Cfg;
using Shesha.NHibernate.Utilites;

namespace Shesha.NHibernate
{
    /// <summary>
    /// Quoted naming strategy. Adds double quotes to the table and column names
    /// Is used for case-sensitive databases like PostgreSQL
    /// </summary>
    internal class QuotedNamingStrategy : INamingStrategy
    {
        private static readonly INamingStrategy Wrapped = DefaultNamingStrategy.Instance;

        private static QuotedNamingStrategy _postgreNamingStrategy;

        public static INamingStrategy Instance
        {
            get { return _postgreNamingStrategy ?? (_postgreNamingStrategy = new QuotedNamingStrategy()); }
        }

        protected QuotedNamingStrategy()
        {
        }

        public string ClassToTableName(string className)
        {
            return Wrapped.ClassToTableName(className);
        }

        public string ColumnName(string columnName)
        {
            return columnName.EscapeDbObjectNameForNH();
        }

        public string LogicalColumnName(string columnName, string propertyName)
        {
            return Wrapped.LogicalColumnName(columnName, propertyName);
        }

        public string PropertyToColumnName(string propertyName)
        {
            return Wrapped.PropertyToColumnName(propertyName);
        }

        public string PropertyToTableName(string className, string propertyName)
        {
            return Wrapped.PropertyToTableName(className, propertyName);
        }

        public string TableName(string tableName)
        {
            return Wrapped.TableName(tableName).EscapeDbObjectNameForNH();
        }
    }
}
