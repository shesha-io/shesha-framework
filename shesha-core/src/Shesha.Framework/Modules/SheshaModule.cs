using System.Threading.Tasks;

namespace Shesha.Modules
{
    /// <summary>
    /// Shesha module
    /// </summary>
    public abstract class SheshaModule: SheshaBaseModule, IHasDataDrivenConfiguration
    {
        /// <summary>
        /// Initialize module configuration. Gets executed on every application start
        /// </summary>
        /// <returns>True if the initialization was performed and false if the initialization is not required.</returns>
        public virtual Task<bool> InitializeConfigurationAsync()
        {
            return Task.FromResult(false);
        }

        /// <summary>
        /// Module info
        /// </summary>
        public abstract SheshaModuleInfo ModuleInfo { get; }
    }
}
