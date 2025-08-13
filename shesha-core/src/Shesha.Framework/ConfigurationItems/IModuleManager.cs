using System;
using System.Reflection;
using System.Threading.Tasks;
using Module = Shesha.Domain.Module;

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
        /// Get module by name. Returns null if module is missing
        /// </summary>
        /// <param name="moduleName">Module name</param>
        /// <returns></returns>
        Task<Module?> GetModuleOrNullAsync(string moduleName);

        /// <summary>
        /// Get module by name. Throws exception when module not found
        /// </summary>
        /// <param name="moduleName">Module name</param>
        /// <returns></returns>
        Task<Module> GetModuleAsync(string moduleName);

        /// <summary>
        /// Get module by Id. Throws exception when module not found
        /// </summary>
        /// <param name="id">Module Id</param>
        /// <returns></returns>
        Task<Module> GetModuleAsync(Guid id);

        /// <summary>
        /// Get module Id
        /// </summary>
        /// <param name="moduleName">Module name</param>
        /// <returns></returns>
        Task<Guid> GetModuleIdAsync(string moduleName);

        /// <summary>
        /// Get or create module for the specified assembly
        /// </summary>
        /// <param name="assembly"></param>
        /// <returns></returns>
        Task<Module?> GetOrCreateModuleAsync(Assembly assembly);
    }
}
