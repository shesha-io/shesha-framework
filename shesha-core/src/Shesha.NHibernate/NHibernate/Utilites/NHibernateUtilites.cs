using FluentMigrator.Runner.BatchParser.RangeSearchers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using NHibernate.Dialect;
using Shesha.Configuration;
using Shesha.Services;

namespace Shesha.NHibernate.Utilites
{
    public static class NHibernateUtilities
    {
        /// <summary>
        /// Connection string with password
        /// </summary>
        public static string ConnectionString => GetConnectionString("Default");

        /// <summary>
        /// Returns connection string. Note: for the Azure environment - uses standard environment variable
        /// </summary>
        public static string GetConnectionString(string name)
        {
            var env = StaticContext.IocManager.IocContainer.Resolve<IWebHostEnvironment>();
            var configuration = AppConfigurations.Get(env.ContentRootPath, env.EnvironmentName, env.IsDevelopment());
            return configuration.GetConnectionString(name);
        }

        /// <summary>
        /// Escape name of the DB object (e.g. column, table) to uise in raw sql
        /// </summary>
        /// <param name="sqlIdentifier">sql identifier (table name, column sname etc.)</param>
        /// <returns></returns>
        public static string EscapeDbObjectName(this string sqlIdentifier)
        {
            return EscapeDbObjectName(sqlIdentifier, '"');
        }

        /// <summary>
        /// Escape name of the DB object (e.g. column, table) to tell NHibernate to generate a valid sql query
        /// Note: for raw sql use <seealso cref="EscapeDbObjectName(string)"/>
        /// </summary>
        /// <param name="sqlIdentifier">sql identifier (table name, column sname etc.)</param>
        /// <returns></returns>
        public static string EscapeDbObjectNameForNH(this string sqlIdentifier) 
        {
            return EscapeDbObjectName(sqlIdentifier, '`');
        }

        private static string EscapeDbObjectName(string sqlIdentifier, char escapeChar)
        {
            return !string.IsNullOrWhiteSpace(sqlIdentifier)
                ? escapeChar + sqlIdentifier.UnescapeDbObjectName() + escapeChar
                : sqlIdentifier;
        }

        /// <summary>
        /// Unescape name of the DB object (e.g. column, table)
        /// </summary>
        /// <param name="sqlIdentifier"></param>
        /// <returns></returns>
        public static string UnescapeDbObjectName(this string sqlIdentifier) 
        {
            var isQuoted = IsQuoted(sqlIdentifier, out var openQuote, out var closeQuote);
            return isQuoted 
                ? sqlIdentifier.Substring(1, sqlIdentifier.Length - 2) 
                : sqlIdentifier;
        }

        private static bool IsQuoted(string sqlIdentifier, out char openQuote, out char closeQuote)
        {
            if (sqlIdentifier == null || sqlIdentifier.Length < 2)
            {
                openQuote = default(char);
                closeQuote = default(char);
                return false;
            }

            openQuote = sqlIdentifier[0];
            closeQuote = sqlIdentifier[sqlIdentifier.Length - 1];
            var quoteType = Dialect.PossibleQuoteChars.IndexOf(openQuote);

            return quoteType >= 0 &&
                   closeQuote == Dialect.PossibleClosedQuoteChars[quoteType];
        }
    }
}