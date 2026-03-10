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
        /// <summary>
        /// Import module configuration
        /// </summary>
        /// <returns></returns>
        protected async Task<bool> ImportConfigurationAsync()
        {
            var seeder = IocManager.Resolve<IEmbeddedPackageSeeder>();

            var context = new EmbeddedPackageSeedingContext(this.GetType().Assembly) 
            { 
                Logger = this.Logger,                
            };
            return seeder != null
                ? await seeder.SeedEmbeddedPackagesAsync(context)
                : false;
        }
    }
}
