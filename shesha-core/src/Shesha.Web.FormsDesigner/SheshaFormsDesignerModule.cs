using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.AutoMapper;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Castle.MicroKernel.Registration;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Modules;
using Shesha.Web.FormsDesigner.Services;
using Shesha.Web.FormsDesigner.Services.Distribution;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner
{
    [DependsOn(typeof(AbpAspNetCoreModule))]
    public class SheshaFormsDesignerModule : SheshaSubModule<SheshaFrameworkModule>
    {
        public override async Task<bool> InitializeConfigurationAsync()
        {
            return await ImportConfigurationAsync();
        }

        public override void Initialize()
        {
            var thisAssembly = Assembly.GetExecutingAssembly();

            IocManager.IocContainer.Register(
                Component.For<IConfigurableItemImport>().Forward<IFormConfigurationImport>().ImplementedBy<FormConfigurationImport>().LifestyleTransient()
            );
            IocManager.IocContainer.Register(
                Component.For<IConfigurableItemExport>().Forward<IFormConfigurationExport>().ImplementedBy<FormConfigurationExport>().LifestyleTransient()
            );

            IocManager.IocContainer.Register(
                Component.For<IConfigurationItemManager>().Forward<IFormManager>().Forward<FormManager>().ImplementedBy<FormManager>().LifestyleTransient()
            );

            IocManager.IocContainer.Register(
                Component.For<IConfigurableItemImport>().Forward<IConfigurableComponentImport>().ImplementedBy<ConfigurableComponentImport>().LifestyleTransient()
            );
            IocManager.IocContainer.Register(
                Component.For<IConfigurableItemExport>().Forward<IConfigurableComponentExport>().ImplementedBy<ConfigurableComponentExport>().LifestyleTransient()
            );

            IocManager.IocContainer.Register(
                Component.For<IConfigurationItemManager>().Forward<IConfigurableComponentManager>().Forward<ConfigurableComponentManager>().ImplementedBy<ConfigurableComponentManager>().LifestyleTransient()
            );

            IocManager.RegisterAssemblyByConvention(thisAssembly);

            Configuration.Modules.AbpAutoMapper().Configurators.Add(
                // Scan the assembly for classes which inherit from AutoMapper.Profile
                cfg => cfg.AddMaps(thisAssembly)
            );
        }

        public override void PreInitialize()
        {
            Configuration.Modules.AbpAspNetCore().CreateControllersForAppServices(
                typeof(SheshaFormsDesignerModule).GetAssembly(),
                moduleName: "Shesha",
                useConventionalHttpVerbs: true);
        }
    }
}
