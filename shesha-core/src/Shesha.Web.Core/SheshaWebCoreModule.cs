using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.AspNetCore.SignalR;
using Abp.AutoMapper;
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
        typeof(SheshaApplicationModule),
        typeof(SheshaNHibernateModule),
        typeof(AbpAspNetCoreModule),
        typeof(AbpAspNetCoreSignalRModule),
        typeof(AbpAutoMapperModule),
        typeof(SheshaElmahModule),
        typeof(SheshaSchedulerModule),
        typeof(SheshaApplicationModule)
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
            Configuration.DefaultNameOrConnectionString = _appConfiguration.GetConnectionString(
                SheshaConsts.ConnectionStringName
            );

            // Use database for language management
            Configuration.Modules.Zero().LanguageManagement.EnableDbLocalization();

            Configuration.Modules.AbpAspNetCore()
                 .CreateControllersForAppServices(
                     typeof(SheshaApplicationModule).GetAssembly()
                 );

            ConfigureTokenAuth();

            /*
            Configuration.Modules.AbpAutoMapper().Configurators.Add(config =>
            {
                config.CreateMap<DataTableColumn, DataTableColumnDto>()
                    .ForMember(u => u.Password, options => options.Ignore())
                    .ForMember(u => u.Email, options => options.MapFrom(input => input.EmailAddress));
            });
            */

            Configuration.Modules.AbpAspNetCore().CreateControllersForAppServices(
                this.GetType().Assembly,
                moduleName: "Shesha",
                useConventionalHttpVerbs: true);
        }

        private void ConfigureTokenAuth()
        {
            IocManager.Register<TokenAuthConfiguration>();

            var tokenAuthConfig = IocManager.Resolve<TokenAuthConfiguration>();

            tokenAuthConfig.SecurityKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_appConfiguration["Authentication:JwtBearer:SecurityKey"]));
            tokenAuthConfig.Issuer = _appConfiguration["Authentication:JwtBearer:Issuer"];
            tokenAuthConfig.Audience = _appConfiguration["Authentication:JwtBearer:Audience"];
            tokenAuthConfig.SigningCredentials = new SigningCredentials(tokenAuthConfig.SecurityKey, SecurityAlgorithms.HmacSha256);
            tokenAuthConfig.Expiration = TimeSpan.FromDays(1);
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
