using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.AspNetCore.SignalR;
using Abp.AutoMapper;
using Abp.FluentValidation;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Abp.Zero.Configuration;
using Boxfusion.Authorization;
using Castle.MicroKernel.Registration;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Shesha.Authentication.JwtBearer;
using Shesha.Authorization;
using Shesha.Bootstrappers;
using Shesha.Configuration;
using Shesha.Configuration.Startup;
using Shesha.Elmah;
using Shesha.Languages;
using Shesha.NHibernate;
using Shesha.Scheduler;
using System;
using System.Text;

namespace Shesha
{
    [DependsOn(
        typeof(SheshaFrameworkModule),
        typeof(SheshaCoreModule),
        typeof(SheshaNHibernateModule),
        typeof(AbpAspNetCoreModule),
        typeof(AbpAspNetCoreSignalRModule),
        typeof(AbpAutoMapperModule),
        typeof(SheshaElmahModule),
        typeof(SheshaSchedulerModule),
        typeof(SheshaApplicationModule),
        typeof(AbpFluentValidationModule)
     )]
    public class SheshaWebCoreModule : AbpModule
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfigurationRoot _appConfiguration;

        public SheshaWebCoreModule(IWebHostEnvironment env)
        {
            _env = env;
            _appConfiguration = env.GetAppConfiguration();
        }

        public override void PreInitialize()
        {
            var config = Configuration.Modules.ShaNHibernate();

            config.UseDbms(c => c.GetDbmsType(), c => c.GetDefaultConnectionString());

            // Use database for language management
            Configuration.Modules.Zero().LanguageManagement.EnableDbLocalization();

            ConfigureTokenAuth();

            Configuration.Modules.AbpAspNetCore().CreateControllersForAppServices(
                this.GetType().Assembly,
                moduleName: "Shesha",
                useConventionalHttpVerbs: true);
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

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(SheshaWebCoreModule).GetAssembly());
            IocManager.IocContainer.Register(
              Component.For<ICustomPermissionChecker>().Forward<ISheshaWebCorePermissionChecker>().Forward<SheshaWebCorePermissionChecker>().ImplementedBy<SheshaWebCorePermissionChecker>().LifestyleTransient()
            );
            IocManager.Register<IBootstrapper, SouthAfricaLanguagesCreator>();
        }
    }
}
