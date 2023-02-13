using Shesha.Domain.ConfigurationItems;
using System.Reflection;
using System.Threading.Tasks;
using Module = Shesha.Domain.ConfigurationItems.Module;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Configurable modules manager
    /// </summary>
    public interface IModuleManager
    {
        /// <summary>
        /// Get existing module or create it if missing
        /// </summary>
        /// <param name="moduleName"></param>
        /// <returns></returns>
        Task<Module> GetOrCreateModuleAsync(string moduleName);
        
        /// <summary>
        /// Get or create module for the specified assembly
        /// </summary>
        /// <param name="assembly"></param>
        /// <returns></returns>
        Task<Module> GetOrCreateModuleAsync(Assembly assembly);
    }
}
