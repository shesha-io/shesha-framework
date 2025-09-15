using System.Collections.Generic;

namespace Shesha.Modules
{
    /// <summary>
    /// Module inheritance provider
    /// </summary>
    public interface IMooduleInheritanceProvider
    {
        /// <summary>
        /// Get module hierarchy
        /// </summary>
        /// <param name="module"></param>
        /// <returns></returns>
        List<string> GetModuleHierarchy(string module);
        
        /// <summary>
        /// Gen base module
        /// </summary>
        /// <param name="module"></param>
        /// <returns></returns>
        string GetBaseModule(string module);
    }
}
