using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
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
        /// Escape name of the DB object (e.g. column, table) to tell NHibernate to generate a valid sql query
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public static string EscapeDbObjectName(this string value)
        {
            return !string.IsNullOrWhiteSpace(value)
                ? "`" + value + "`"
                : value;
        }
    }
}