using System;

namespace Shesha.Modules
{
    /// <summary>
    /// Shesha submodule
    /// </summary>
    public interface ISheshaSubmodule
    {
        /// <summary>
        /// Module type current submodule belongs to
        /// </summary>
        Type ModuleType { get; }
    }
}
