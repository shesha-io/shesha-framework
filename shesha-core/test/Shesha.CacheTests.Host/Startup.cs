using System;
using System.IO;
using System.Linq;
using Abp.AspNetCore;
using Abp.AspNetCore.SignalR.Hubs;
using Abp.Castle.Logging.Log4Net;
using Castle.Facilities.Logging;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Mvc.Controllers;
using Swashbuckle.AspNetCore.Swagger;
using Swashbuckle.AspNetCore.SwaggerGen;
using Shesha.DynamicEntities.Swagger;
using Shesha;
using Shesha.Authorization;
using Shesha.Configuration;
using Shesha.DynamicEntities;
using Shesha.Elmah;
using Shesha.Exceptions;
using Shesha.Extensions;
using Shesha.GraphQL;
using Shesha.Identity;
using Shesha.Notifications;
using Shesha.Notifications.SMS;
using Shesha.Specifications;
using Shesha.Swagger;
using Shesha.Utilities;
using Abp.Extensions;
using Shesha.Web;

namespace Shesha.CacheTests.Host
{
    /// <summary>
    /// Adapted from Boxfusion.SheshaFunctionalTests.Web.Host's Startup, deliberately kept close to
    /// it so the framework behaviour under test is the same. Differences, all intentional:
    ///
    ///   * NO AddHangfireServer -- storage and client are registered so anything that enqueues a
    ///     job still resolves, but no worker runs. Three instances against one SQL storage would
    ///     otherwise execute scheduled jobs in triplicate and pollute the measurements.
    ///   * No Swagger UI, no GraphQL playground, no Hangfire dashboard -- unused by the tests, and
    ///     the Swagger UI in particular pulls an embedded resource from the other host's assembly.
    ///
    /// Swagger *generation* IS registered, and is not optional: a Shesha module registers
    /// CachingSwaggerProvider unconditionally, which needs Swashbuckle's ISchemaGenerator. Omitting
    /// AddSwaggerGen makes every request fail at startup with ComponentNotFoundException.
    /// </summary>
    public class Startup
    {
        private readonly IConfigurationRoot _appConfiguration;
        private readonly IWebHostEnvironment _hostEnvironment;

        public Startup(IWebHostEnvironment hostEnvironment)
        {
            _appConfiguration = hostEnvironment.GetAppConfiguration();
            _hostEnvironment = hostEnvironment;
        }

        public IServiceProvider ConfigureServices(IServiceCollection services)
        {
            services.Configure<IISServerOptions>(options => options.AllowSynchronousIO = true);

            services.AddSheshaElmah(_appConfiguration);

            services.AddMvcCore(options =>
            {
                options.EnableEndpointRouting = false;
                options.Conventions.Add(new ApiExplorerGroupPerControllerConvention());

                options.EnableDynamicDtoBinding();
                options.AddDynamicAppServices(services);

                // SheshaAuthorizationFilter is the hot path these tests exercise -- it is what
                // reads the permissioned-object cache on every request.
                options.Filters.AddService(typeof(SheshaAuthorizationFilter));
                options.Filters.AddService(typeof(SheshaExceptionFilter), order: 1);
                options.Filters.AddService(typeof(SpecificationsActionFilter), order: 1);
            })
            .AddApiExplorer()
            .AddDataAnnotations()
            .AddNewtonsoftJson(options => options.UseCamelCasing(true));

            IdentityRegistrar.Register(services);
            AuthConfigurer.Configure(services, _appConfiguration);

            services.AddSignalR(options => options.EnableDetailedErrors = true);
            services.AddCors();
            AddApiVersioning(services);
            services.AddHttpContextAccessor();

            services.AddTransient<INotificationChannelSender, EmailChannelSender>();
            services.AddTransient<INotificationChannelSender, SmsChannelSender>();

            // Hangfire storage/client only -- see the class remarks. AddHangfireServer is
            // deliberately absent.
            services.AddHangfire(config =>
            {
                var dbms = _appConfiguration.GetDbmsType();
                var connStr = _appConfiguration.GetDefaultConnectionString();

                switch (dbms)
                {
                    case DbmsType.SQLServer:
                        config.UseSqlServerStorage(connStr);
                        break;
                    case DbmsType.PostgreSQL:
                        config.UsePostgreSqlStorage(options => options.UseNpgsqlConnection(connStr));
                        break;
                }
            });

            services.AddSheshaGraphQL();

            return services.AddAbp<CacheTestsWebHostModule>(options =>
            {
                options.IocManager.IocContainer.AddFacility<LoggingFacility>(
                    f => f.UseAbpLog4Net().WithConfig("log4net.config"));
            });
        }

        public void Configure(IApplicationBuilder app)
        {
            // AddHangfire registers JobStorage in DI but does not set the JobStorage.Current
            // static -- normally AddHangfireServer does that. ABP's Hangfire background-job
            // manager reads the static during module initialisation, so without this every
            // request fails with "Current JobStorage instance has not been initialized yet".
            // Set it here, before UseAbp, to get storage and a working client without a worker.
            JobStorage.Current = app.ApplicationServices.GetRequiredService<JobStorage>();

            app.UseSheshaElmah();

            AppContextHelper.Configure(app.ApplicationServices.GetRequiredService<IHttpContextAccessor>());

            app.UseConfigurationFramework();
            app.UseAbp(options => options.UseAbpRequestLocalization = false);
            app.UseSecurityHeaders();

            var corsOrigins = _appConfiguration["App:CorsOrigins"]?
                .Split(",", StringSplitOptions.RemoveEmptyEntries)
                .Select(o => o.Trim().TrimEnd('/'))
                .Where(o => !string.IsNullOrEmpty(o))
                .ToArray() ?? Array.Empty<string>();

            app.UseCors(x => x
                .AllowAnyMethod()
                .AllowAnyHeader()
                .WithOrigins(corsOrigins)
                .AllowCredentials());

            app.UseStaticFiles();
            app.UseAuthentication();
            app.UseAbpRequestLocalization();
            app.UseRouting();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "defaultWithArea",
                    pattern: "{area}/{controller=Home}/{action=Index}/{id?}");
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
                endpoints.MapHub<AbpCommonHub>("/signalr");
                endpoints.MapControllers();
            });
        }

        private void AddApiVersioning(IServiceCollection services)
        {
            // The dynamic app-service API depends on this specification to expose
            // Settings/PermissionedObject under /api/services/app/...
            services.Replace(ServiceDescriptor.Singleton<IApiControllerSpecification, AbpAppServiceApiVersionSpecification>());

            services.Configure<OpenApiInfo>(_appConfiguration.GetSection(nameof(OpenApiInfo)));
            services.AddTransient<IConfigureOptions<SwaggerGenOptions>, ConfigureSwaggerOptions>();

            // Required even though no Swagger UI is served: a Shesha module resolves
            // CachingSwaggerProvider, which depends on Swashbuckle's ISchemaGenerator.
            services.AddSwaggerGen(options =>
            {
                options.DescribeAllParametersInCamelCase();
                options.IgnoreObsoleteActions();
                options.AddXmlDocuments();

                options.SchemaFilter<DynamicDtoSchemaFilter>();
                options.OperationFilter<SwaggerOperationFilter>();
                options.DocumentFilter<SwaggerDocumentFilter>();

                options.CustomSchemaIds(type => SwaggerHelper.GetSchemaId(type));
                options.CustomOperationIds(desc => desc.ActionDescriptor is ControllerActionDescriptor d
                    ? d.ControllerName.ToCamelCase() + d.ActionName.ToPascalCase()
                    : null);

                options.AddDocumentsPerService();
            });
            services.Replace(ServiceDescriptor.Transient<ISwaggerProvider, CachingSwaggerProvider>());

            services.AddApiVersioning(options =>
            {
                options.AssumeDefaultVersionWhenUnspecified = true;
                options.DefaultApiVersion = ApiVersion.Default;
                options.ReportApiVersions = true;
            });

            services.AddVersionedApiExplorer(options =>
            {
                options.GroupNameFormat = "'v'VVV";
                options.SubstituteApiVersionInUrl = true;
            });
        }
    }
}
