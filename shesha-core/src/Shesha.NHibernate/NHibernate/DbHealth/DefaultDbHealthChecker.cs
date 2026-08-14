using Abp.Dependency;
using NHibernate;
using NHibernate.Util;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.NHibernate.DbHealth
{
    /// <summary>
    /// Default DB Health checker
    /// </summary>
    public class DefaultDbHealthChecker : IDbHealthChecker, ITransientDependency
    {
        private readonly ISessionFactory _sessionFactory;
        public DefaultDbHealthChecker(ISessionFactory sessionFactory)
        {
            _sessionFactory = sessionFactory;
        }

        /// <summary>
        /// Check DB health. Method should throw exception if DB is not healthy
        /// </summary>
        /// <returns></returns>
        public async Task CheckHealthAsync(CheckHealthArguments args)
        {
            var issues = await GetHealthIssuesAsync(args.DatabaseType);
            if (issues.Any())
                throw new DbHealthFailedException(issues.ToList());
        }

        private async Task<IList<string>> GetHealthIssuesAsync(DbmsType dbmsType) 
        {
            using (var session = _sessionFactory.OpenSession())
            {
                var sql = GetSqlForDbms(dbmsType);

                // Create a raw SQL query
                var query = session.CreateSQLQuery(sql);

                // Map the result column "Message" to a string
                query.AddScalar("Message", NHibernateUtil.String);

                // Execute and get results
                return await query.ListAsync<string>();
            }
        }

        private static string GetSqlForDbms(DbmsType dbmsType)
        {
            switch (dbmsType) 
            { 
                case DbmsType.SQLServer:
                    return "EXEC frwk.check_db_health";
                case DbmsType.PostgreSQL:
                    return "SELECT * FROM frwk.check_db_health()";
                default:
                    throw new NotSupportedException($"DBMS of type '{dbmsType}' is not supported.");
            }            
        }
    }
}
