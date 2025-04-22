using Abp.Modules;
using Abp.Reflection.Extensions;
using Castle.MicroKernel.Registration;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ShaCompanyName.ShaProjectName.Application;
using ShaCompanyName.ShaProjectName.Common.Authorization;
using ShaCompanyName.ShaProjectName.Domain;
using Shesha;
using Shesha.Authentication.JwtBearer;
using Shesha.Authorization;
using Shesha.Configuration;
using Shesha.Configuration.Startup;
using Shesha.Elmah;
using Shesha.Import;
using Shesha.Sms.Clickatell;
using Shesha.Web.FormsDesigner;
using System;
using System.Text;

namespace ShaCompanyName.ShaProjectName
{
    /// <summary>
    /// ReSharper disable once InconsistentNaming
    /// </summary>
    [DependsOn(
        // Adding all the ShaProjectName Modules
        typeof(SheshaFrameworkModule),
        typeof(SheshaApplicationModule),
        typeof(SheshaFormsDesignerModule),
        typeof(SheshaElmahModule),
        typeof(SheshaImportModule),
        typeof(SheshaClickatellModule),
        typeof(ShaProjectNameModule),
        typeof(ShaProjectNameApplicationModule)
	 )]
    public class ShaProjectNameWebCoreModule : AbpModule
    {
        private readonly IConfigurationRoot _appConfiguration;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="env"></param>
        public ShaProjectNameWebCoreModule(IWebHostEnvironment env)
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

            //config.UseMsSql();
            //config.UsePostgreSql();

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
            tokenAuthConfig.Expiration = TimeSpan.FromDays(5);
        }

        /// <summary>
        /// 
        /// </summary>
        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(ShaProjectNameWebCoreModule).GetAssembly());

            IocManager.IocContainer.Register(
            Component.For<ICustomPermissionChecker>().Forward<IShaProjectNamePermissionChecker>().Forward<ShaProjectNamePermissionChecker>().ImplementedBy<ShaProjectNamePermissionChecker>().LifestyleTransient()                );
        }
    }
}
