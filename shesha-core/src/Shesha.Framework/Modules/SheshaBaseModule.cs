using Abp.Modules;
using Shesha.ConfigurationItems.Distribution;
using System.Threading.Tasks;

namespace Shesha.Modules
{
    /// <summary>
    /// Base class of Shesha module/submodule
    /// </summary>
    public abstract class SheshaBaseModule : AbpModule
    {
        protected async Task<bool> ImportConfigurationAsync()
        {
            var seeder = IocManager.Resolve<IEmbeddedPackageSeeder>();

            var context = new EmbeddedPackageSeedingContext(this.GetType().Assembly) 
            { 
                Logger = this.Logger,
            };
            return await seeder?.SeedEmbeddedPackagesAsync(context);
        }
    }
}
