using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.Modules;
using Castle.MicroKernel.Registration;
using System.Reflection;

namespace Shesha.Sms.Xml2Sms
{
    [DependsOn(typeof(SheshaFrameworkModule), typeof(SheshaApplicationModule), typeof(AbpAspNetCoreModule))]
    public class SheshaXml2SmsModule : AbpModule
    {
        public override void PreInitialize()
        {
            Configuration.Settings.Providers.Add<Xml2SmsSettingProvider>();

            Configuration.Modules.AbpAspNetCore().CreateControllersForAppServices(
                this.GetType().Assembly,
                moduleName: "SheshaXml2Sms",
                useConventionalHttpVerbs: true);
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(Assembly.GetExecutingAssembly());

            IocManager.IocContainer.Register(
                Component.For<IXml2SmsGateway>().Forward<Xml2SmsGateway>().ImplementedBy<Xml2SmsGateway>().LifestyleTransient()
            );
        }
    }
}
