using Abp.Modules;
using Abp.Reflection.Extensions;
using Boxfusion.SheshaFunctionalTests.Common;
using Boxfusion.SheshaFunctionalTests.Common.Authorization;
using Boxfusion.SheshaFunctionalTests.ModuleA;
using Boxfusion.SheshaFunctionalTests.ModuleB;
using Castle.MicroKernel.Registration;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Shesha;
using Shesha.Authentication.JwtBearer;
using Shesha.Authorization;
using Shesha.Configuration;
using Shesha.Configuration.Startup;
using Shesha.Elmah;
using Shesha.Import;
using Shesha.Modules;
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
        typeof(SheshaFunctionalTestsModuleA),
        typeof(SheshaFunctionalTestsModuleB)
     )]
    public class SheshaFunctionalTestsWebCoreModule : SheshaModule
    {
        private readonly IConfigurationRoot _appConfiguration;

        public override SheshaModuleInfo ModuleInfo => new SheshaModuleInfo("Boxfusion.SheshaFunctionalTests.Web")
        {
            FriendlyName = "Shesha Functional Tests Web",
            Publisher = "Boxfusion",
            Alias = "functionalTestsWeb",
            Hierarchy = [typeof(SheshaFunctionalTestsModuleA), typeof(SheshaFunctionalTestsModuleB), typeof(SheshaFunctionalTestsCommonModule), typeof(SheshaFrameworkModule)],
        };

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
            var config = Configuration.Modules.ShaNHibernate();
            
            config.UseDbms(c => c.GetDbmsType(), c => c.GetDefaultConnectionString());

            ConfigureTokenAuth();
        }

        private void ConfigureTokenAuth()
        {
            IocManager.Register<TokenAuthConfiguration>();
            var tokenAuthConfig = IocManager.Resolve<TokenAuthConfiguration>();

            tokenAuthConfig.SecurityKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_appConfiguration.GetRequired("Authentication:JwtBearer:SecurityKey")));
            tokenAuthConfig.Issuer = _appConfiguration.GetRequired("Authentication:JwtBearer:Issuer");
            tokenAuthConfig.Audience = _appConfiguration.GetRequired("Authentication:JwtBearer:Audience");
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
