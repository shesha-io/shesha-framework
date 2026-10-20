using Abp.AspNetCore;
using Abp.AspNetCore.SignalR.Hubs;
using Abp.Castle.Logging.Log4Net;
using Abp.PlugIns;
using Castle.Facilities.Logging;
using ElmahCore;
using ElmahCore.Mvc;
using GraphQL;
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
using Microsoft.OpenApi;
using Shesha;
using Shesha.Authentication;
using Shesha.Authorization;
using Shesha.Configuration;
using Shesha.DynamicEntities;
using Shesha.Elmah;
using Shesha.Exceptions;
using Shesha.Extensions;
using Shesha.GraphQL;
using Shesha.Identity;
using Shesha.Scheduler.Extensions;
using Shesha.Swagger;
using Shesha.Web;
using Swashbuckle.AspNetCore.Swagger;
using Swashbuckle.AspNetCore.SwaggerGen;
using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace ShaCompanyName.ShaProjectName.Web.Host.Startup
{
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
			services.Configure<IISServerOptions>(options =>
			{
				options.AllowSynchronousIO = true;
			});

			services.AddElmah<XmlFileErrorLog>(options =>
			{
				options.Path = @"elmah";
				options.LogPath = Path.Combine(_hostEnvironment.ContentRootPath, "App_Data", "ElmahLogs");
				//options.CheckPermissionAction = context => context.User.Identity.IsAuthenticated; //note: looks like we have to use cookies for it
				options.Filters.Add(new ElmahFilter());
			});

			services.AddMvcCore(options =>
			{
				options.EnableEndpointRouting = false;
				options.Conventions.Add(new ApiExplorerGroupPerControllerConvention());

				options.EnableDynamicDtoBinding();
				options.AddDynamicAppServices(services);

                    options.Filters.AddService(typeof(SheshaAuthorizationFilter));
                    options.Filters.AddService(typeof(SheshaExceptionFilter), order: 1);
                })
                .AddApiExplorer()
                .AddNewtonsoftJson(options =>
                {
                    options.UseCamelCasing(true);
                });

			IdentityRegistrar.Register(services);
			AuthConfigurer.Configure(services, _appConfiguration);

			services.AddSignalR();

			services.AddCors();
			
			AddApiVersioning(services);

			services.AddHttpContextAccessor();

			services.AddHangfire(config =>
			{
				var dbms = _appConfiguration.GetDbmsType();
				var connStr = _appConfiguration.GetDefaultConnectionString();

				switch (dbms) 
				{
                    case DbmsType.SQLServer:
                        {
                            config.UseSqlServerStorage(connStr);
                            break;
                        }
                    case DbmsType.PostgreSQL:
                        {
                            config.UsePostgreSqlStorage(options => {
                                options.UseNpgsqlConnection(connStr);
                            });
                            break;
                        }
                }
            });
            services.AddHangfireServer(_ => {
            });

            // add Shesha GraphQL
            services.AddSheshaGraphQL();

			// Add ABP and initialize 
			// Configure Abp and Dependency Injection
			return services.AddAbp<SheshaWebHostModule>(
				options =>
				{
					// Configure Log4Net logging
					options.IocManager.IocContainer.AddFacility<LoggingFacility>(f => f.UseAbpLog4Net().WithConfig("log4net.config"));

					// configure plugins
					var pluginsFolder = Path.Combine(_hostEnvironment.ContentRootPath, "Plugins");
					if (Directory.Exists(pluginsFolder))
						options.PlugInSources.AddFolder(Path.Combine(_hostEnvironment.ContentRootPath, "Plugins"), SearchOption.AllDirectories);
				}
			);
		}

		public void Configure(IApplicationBuilder app, IBackgroundJobClient backgroundJobs)
		{
			// Security headers. Registered first and applied in `OnStarting` so that the values
			// are written on every response and cannot be overwritten by later middleware.
			app.Use(async (context, next) =>
			{
				context.Response.OnStarting(() =>
				{
					context.Response.Headers["X-Content-Type-Options"] = "nosniff";
					context.Response.Headers["X-Frame-Options"] = "DENY";
					context.Response.Headers["X-XSS-Protection"] = "0";
					context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
					context.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
					return Task.CompletedTask;
				});
				await next();
			});

			app.UseSheshaElmah();

			// note: already registered in the ABP
			AppContextHelper.Configure(app.ApplicationServices.GetRequiredService<IHttpContextAccessor>());

			app.UseConfigurationFramework();

			app.UseAbp(options =>
			{
				options.UseAbpRequestLocalization = false;
			}); // Initializes ABP framework.​
				//app.UseCors(_defaultCorsPolicyName); // Enable CORS!
				// global cors policy
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

			app.UseAbpRequestLocalization();

			app.UseRouting();

            app.UseAuthentication();

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
				endpoints.MapSignalRHubs();
			});

            // Block access to Swagger UI when the setting is disabled
            app.UseMiddleware<SwaggerUiAccessMiddleware>();

            // Enable middleware to serve generated Swagger as a JSON endpoint
            app.UseSwagger();

			// Enable middleware to serve swagger-ui assets (HTML, JS, CSS etc.)
			app.UseSwaggerUI(options =>
			{
				options.AddEndpointsPerService();
				options.IndexStream = () => Assembly.GetExecutingAssembly()
					.GetManifestResourceStream("ShaCompanyName.ShaProjectName.Web.Host.wwwroot.swagger.ui.index.html");
			}); // URL: /swagger​

            app.UseSheshaHangfireDashboard();
		}

		private void AddApiVersioning(IServiceCollection services)
		{
			services.Replace(ServiceDescriptor.Singleton<IApiControllerSpecification, AbpAppServiceApiVersionSpecification>());
			services.Configure<OpenApiInfo>(_appConfiguration.GetSection(nameof(OpenApiInfo)));

			services.AddTransient<IConfigureOptions<SwaggerGenOptions>, ConfigureSwaggerOptions>();

			//Swagger - Enable this line and the related lines in Configure method to enable swagger UI
			services.AddSwaggerGen(options =>
			{
                options.UseSheshaDefaults();

                options.AddDocumentsPerService();

				// Define the BearerAuth scheme that's in use
				options.AddSecurityDefinition("bearerAuth", new OpenApiSecurityScheme()
				{
					Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
					Name = "Authorization",
					In = ParameterLocation.Header,
					Type = SecuritySchemeType.ApiKey
				});
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