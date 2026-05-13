using ElmahCore;
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
                            ApplyOptions(options, configRoot);
                        });
                        break;
                    }
                case DbmsType.PostgreSQL:
                    {
                        services.AddElmah<SheshaPgsqlErrorLog>(options =>
                        {
                            ApplyOptions(options, configRoot);
                        });
                        break;
                    }
            }
        }

        private static void ApplyOptions(ElmahOptions options, IConfigurationRoot configuration) 
        {
            options.Path = @"elmah";
            options.ConnectionString = configuration.GetDefaultConnectionString();
            options.Filters.Add(new DefaultErrorFilter());

            var settings = GetElmahSettings(configuration);

            if (!string.IsNullOrWhiteSpace(settings.Path))
                options.Path = settings.Path;
        }

        private static SheshaElmahSettings GetElmahSettings(IConfigurationRoot configuration) 
        {
            var sheshaElmahSection = configuration.GetSection(SheshaElmahSettings.SectionName);

            SheshaElmahSettings.IsFetchingDisabled = sheshaElmahSection.GetValue<bool>(SheshaElmahSettings.IsFetchingDisabledKey);
            SheshaElmahSettings.IsLoggingDisabled = sheshaElmahSection.GetValue<bool>(SheshaElmahSettings.IsLoggingDisabledKey);

            return new SheshaElmahSettings
            {
                Path = sheshaElmahSection.GetValue<string>(SheshaElmahSettings.PathKey)
            };            
        }


        public static IApplicationBuilder UseSheshaElmah(this IApplicationBuilder app) 
        {
            app.UseMiddleware<SheshaErrorContextMiddleware>();
            return app.UseElmah();
        }
    }
}
