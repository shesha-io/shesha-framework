using System;
using System.Text;
using Abp.Hangfire;
using Abp.Hangfire.Configuration;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using NHibernate.Dialect;
using NHibernate.Driver;
using Castle.MicroKernel.Registration;
using Shesha.Authorization;
using Shesha.Authentication.JwtBearer;
using Shesha.CacheTests.Host.TestTargets;
using Shesha.Settings.Ioc;
using Shesha.Modules;
using Shesha.Configuration;
using Shesha.Configuration.Startup;
using Shesha.Elmah;
using Shesha.Import;
using Shesha.Redis;
using Shesha.Sms.Clickatell;
using Shesha.Web.FormsDesigner;

namespace Shesha.CacheTests.Host
{
    /// <summary>
    /// Module graph for the cache-coherence rig.
    ///
    /// Deliberately depends on shesha-core modules only. It used to reach the same graph through
    /// Boxfusion.SheshaFunctionalTests.Web.Core, which dragged that whole application -- and its own
    /// domain, application and test projects -- into the framework solution for no benefit: the
    /// caching behaviour under test is entirely framework-level.
    ///
    /// The three things Web.Core contributed that are genuinely needed (Redis wiring, the NHibernate
    /// DBMS configuration and token auth) are set up below.
    ///
    /// Hangfire is registered as a background-job provider, but Startup deliberately does not call
    /// AddHangfireServer: the client and storage exist so anything that enqueues a job still
    /// resolves, while no worker runs. Three instances sharing one SQL storage would otherwise
    /// execute scheduled jobs in triplicate and add noise to the measurements.
    /// </summary>
    [DependsOn(
        typeof(SheshaFrameworkModule),
        typeof(SheshaApplicationModule),
        typeof(SheshaFormsDesignerModule),
        typeof(SheshaImportModule),
        typeof(SheshaClickatellModule),
        typeof(SheshaElmahModule),
        typeof(SheshaRedisModule),
        typeof(AbpHangfireAspNetCoreModule))]
    public class CacheTestsWebHostModule : SheshaModule
    {
        /// <summary>
        /// Settings resolve their module from the declaring assembly, so this host has to be a
        /// Shesha module in its own right rather than an ABP one. It used to inherit that
        /// identity from the functional-test application it referenced.
        /// </summary>
        public override SheshaModuleInfo ModuleInfo => new SheshaModuleInfo(ModuleName)
        {
            FriendlyName = "Shesha Cache Tests",
            Publisher = "Boxfusion",
        };

        public const string ModuleName = "Shesha.CacheTests";
        private readonly IConfigurationRoot _appConfiguration;

        public CacheTestsWebHostModule(IWebHostEnvironment env)
        {
            _appConfiguration = env.GetAppConfiguration();
        }

        public override void PreInitialize()
        {
            Configuration.BackgroundJobs.UseHangfire();

            // The whole point of the rig: without this the cache is ABP's in-memory one and there
            // is nothing multi-instance to test.
            Configuration.Caching.UseSheshaRedisIfConfigured();

            var hnConfig = Configuration.Modules.ShaNHibernate();
            var dbmsType = _appConfiguration.GetDbmsType();
            hnConfig.UseDbms(c => dbmsType, c => c.GetDefaultConnectionString());

            if (dbmsType == DbmsType.SQLServer)
            {
                var useMicrosoftSqlClient = _appConfiguration.GetValue("UseMicrosoftSqlClient", true);
                if (useMicrosoftSqlClient)
                {
                    hnConfig.UseDialect<MsSql2012Dialect>();
                    hnConfig.UseDriver<MicrosoftDataSqlClientDriver>();
                }
            }

            ConfigureTokenAuth();
        }

        /// <summary>
        /// Required for /api/TokenAuth/Authenticate, which every test uses to obtain a token. The
        /// signing key must match across instances or a token minted by one is rejected by the
        /// others -- the suite asserts that, so drift here surfaces as an auth failure rather than
        /// as phantom cache incoherence.
        /// </summary>
        private void ConfigureTokenAuth()
        {
            IocManager.Register<TokenAuthConfiguration>();
            var tokenAuthConfig = IocManager.Resolve<TokenAuthConfiguration>();

            tokenAuthConfig.SecurityKey = new SymmetricSecurityKey(
                Encoding.ASCII.GetBytes(_appConfiguration["Authentication:JwtBearer:SecurityKey"]
                    ?? throw new InvalidOperationException("Authentication:JwtBearer:SecurityKey is required.")));
            tokenAuthConfig.Issuer = _appConfiguration["Authentication:JwtBearer:Issuer"];
            tokenAuthConfig.Audience = _appConfiguration["Authentication:JwtBearer:Audience"];
            tokenAuthConfig.SigningCredentials =
                new SigningCredentials(tokenAuthConfig.SecurityKey, SecurityAlgorithms.HmacSha256);
            tokenAuthConfig.Expiration = TimeSpan.FromDays(1);
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(CacheTestsWebHostModule).GetAssembly());

            // The setting the coherence suite writes to. Registered here so the tests do not
            // need another application to borrow a setting from.
            IocManager.RegisterSettingAccessor<ICacheTestSettings>(s => s.TestValue.WithDefaultValue(0));

            // Registered explicitly for the interface, because ShaPermissionChecker discovers
            // these via ResolveAll<ICustomPermissionChecker>().
            IocManager.IocContainer.Register(
                Component.For<ICustomPermissionChecker>()
                    .ImplementedBy<CacheTestsPermissionChecker>()
                    .LifestyleTransient());
        }
    }
}
