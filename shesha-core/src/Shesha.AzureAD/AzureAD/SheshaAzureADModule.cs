using Abp.Modules;
using Abp.Zero;
using Shesha.AzureAD.Configuration;
using Shesha.Modules;
using Shesha.Settings.Ioc;
using System.Reflection;

namespace Shesha.AzureAD
{
    /// <summary>
    /// This module extends module zero to add AzureAD authentication.
    /// </summary>
    [DependsOn(typeof(AbpZeroCommonModule))]
    public class SheshaAzureADModule : SheshaModule
    {
        public const string ModuleName = "Shesha.AzureAD";
        public override SheshaModuleInfo ModuleInfo => new SheshaModuleInfo(ModuleName)
        {
            FriendlyName = "Shesha Azure AD",
            Publisher = "Shesha"
        };

        public override void PreInitialize()
        {
            IocManager.Register<ISheshaAzureADModuleConfig, SheshaAzureADModuleConfig>();
        }

        public override void Initialize()
        {
            IocManager.RegisterSettingAccessor<IAzureADSettings>();

            IocManager.RegisterAssemblyByConvention(Assembly.GetExecutingAssembly());
        }
    }
}
