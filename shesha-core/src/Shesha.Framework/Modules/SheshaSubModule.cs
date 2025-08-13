using System;
using System.Threading.Tasks;

namespace Shesha.Modules
{
    /// <summary>
    /// Shesha submodule. 
    /// When a Shesha module consists of more than one ABP modules one of them should be considered main module (inherited from <see cref="SheshaModule"/>) and other ones - submodules (inherited from <see cref="SheshaSubModule{TModule}"/>)
    /// </summary>
    /// <typeparam name="TModule"></typeparam>
    public abstract class SheshaSubModule<TModule> : SheshaBaseModule, ISheshaSubmodule, IHasDataDrivenConfiguration where TModule : SheshaModule
    {
        /// <summary>
        /// Type of main Shesha module
        /// </summary>
        public Type ModuleType => typeof(TModule);

        /// <summary>
        /// Initialize module configuration. Gets executed on every application start
        /// </summary>
        /// <returns>True if the initialization was performed and false if the initialization is not required.</returns>
        public virtual Task<bool> InitializeConfigurationAsync()
        {
            return Task.FromResult(false);
        }
    }
}
