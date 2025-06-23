using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.AutoMapper;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Shesha.ConfigurationItems;
using Shesha.Domain;
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
        public override Task<bool> InitializeConfigurationAsync()
        {
            return ImportConfigurationAsync();
        }

        public override void Initialize()
        {
            var thisAssembly = Assembly.GetExecutingAssembly();

            IocManager
                .RegisterConfigurableItemManager<FormConfiguration, IFormManager, FormManager>()
                .RegisterConfigurableItemExport<FormConfiguration, IFormConfigurationExport, FormConfigurationExport>()
                .RegisterConfigurableItemImport<FormConfiguration, IFormConfigurationImport, FormConfigurationImport>();

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
