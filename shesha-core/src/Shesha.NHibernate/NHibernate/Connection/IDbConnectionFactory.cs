using System.Data.Common;

namespace Shesha.NHibernate.Connection
{
    /// <summary>
    /// Database connection factory
    /// </summary>
    public interface IDbConnectionFactory
    {
        /// <summary>
        /// Create new connection for the specified <paramref name="connectionString"/>
        /// </summary>
        /// <param name="connectionString"></param>
        /// <returns></returns>
        DbConnection CreateConnection(string connectionString);
    }
}
