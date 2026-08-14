using Abp.Modules;
using Abp.Reflection.Extensions;
using Boxfusion.SheshaFunctionalTests.Common;
using Boxfusion.SheshaFunctionalTests.Common.Authorization;
using Castle.MicroKernel.Registration;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using NHibernate.Dialect;
using NHibernate.Driver;
using Shesha;
using Shesha.Authentication.JwtBearer;
using Shesha.Authorization;
using Shesha.Configuration;
using Shesha.Configuration.Startup;
using Shesha.Elmah;
using Shesha.Import;
using Shesha.Redis;
using Shesha.Sms.Clickatell;
using Shesha.Web.FormsDesigner;
using System;
using System.Text;

namespace Boxfusion.SheshaFunctionalTests
{
    /// <summary>
    /// ReSharper disable once InconsistentNaming
    /// </summary>
    [DependsOn(
        // Adding all the SheshaFunctionalTests Modules
        typeof(SheshaFrameworkModule),
        typeof(SheshaApplicationModule),
        typeof(SheshaFormsDesignerModule),
        typeof(SheshaImportModule),
        typeof(SheshaClickatellModule),
        typeof(SheshaFunctionalTestsCommonModule),
        typeof(SheshaElmahModule),
        typeof(SheshaFunctionalTestsCommonApplicationModule),
        typeof(SheshaRedisModule)
     )]
    public class SheshaFunctionalTestsWebCoreModule : AbpModule
    {
        private readonly IConfigurationRoot _appConfiguration;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="env"></param>
        public SheshaFunctionalTestsWebCoreModule(IWebHostEnvironment env)
        {
            _appConfiguration = env.GetAppConfiguration();
        }

        /// <summary>
        /// 
        /// </summary>
        public override void PreInitialize()
        {
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

        private void ConfigureTokenAuth()
        {
            IocManager.Register<TokenAuthConfiguration>();
            var tokenAuthConfig = IocManager.Resolve<TokenAuthConfiguration>();

            tokenAuthConfig.SecurityKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_appConfiguration["Authentication:JwtBearer:SecurityKey"]));
            tokenAuthConfig.Issuer = _appConfiguration["Authentication:JwtBearer:Issuer"];
            tokenAuthConfig.Audience = _appConfiguration["Authentication:JwtBearer:Audience"];
            tokenAuthConfig.SigningCredentials = new SigningCredentials(tokenAuthConfig.SecurityKey, SecurityAlgorithms.HmacSha256);
            // Min expiration is 60 seconds, max is 30 days
            tokenAuthConfig.Expiration = int.TryParse(_appConfiguration["Authentication:JwtBearer:ExpirationSeconds"], out var expiration) && expiration >= 60 && expiration <= 86400 * 30
                ? TimeSpan.FromSeconds(expiration)
                : TimeSpan.FromDays(1);
        }

        /// <summary>
        /// 
        /// </summary>
        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(SheshaFunctionalTestsWebCoreModule).GetAssembly());

            IocManager.IocContainer.Register(
            Component.For<ICustomPermissionChecker>().Forward<ISheshaFunctionalTestsPermissionChecker>().Forward<SheshaFunctionalTestsPermissionChecker>().ImplementedBy<SheshaFunctionalTestsPermissionChecker>().LifestyleTransient()                );
        }
    }
}
