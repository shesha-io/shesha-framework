using ElmahCore.Mvc;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Shesha.Elmah.PostgreSql;
using Shesha.Elmah.SqlServer;

namespace Shesha.Elmah
{
    public static class ElmahServiceCollectionExtensions
    {
        public static void AddSheshaElmah(this IServiceCollection services, IConfigurationRoot configRoot) 
        {
            var dbms = configRoot.GetDbmsType();
            switch (dbms)
            {
                case DbmsType.SQLServer:
                    {
                        services.AddElmah<SheshaSqlErrorLog>(options =>
                        {
                            options.Path = @"elmah";
                            options.ConnectionString = configRoot.GetDefaultConnectionString();
                            options.Filters.Add(new DefaultErrorFilter());
                        });
                        break;
                    }
                case DbmsType.PostgreSQL:
                    {
                        services.AddElmah<SheshaPgsqlErrorLog>(options =>
                        {
                            options.Path = @"elmah";
                            options.ConnectionString = configRoot.GetDefaultConnectionString();
                            options.Filters.Add(new DefaultErrorFilter());
                        });
                        break;
                    }
            }
        }

        public static IApplicationBuilder UseSheshaElmah(this IApplicationBuilder app) 
        {
            app.UseMiddleware<SheshaErrorContextMiddleware>();
            return app.UseElmah();
        }
    }
}
