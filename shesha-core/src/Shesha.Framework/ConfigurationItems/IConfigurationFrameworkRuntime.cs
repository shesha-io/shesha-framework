using Shesha.ConfigurationItems.Models;
using System;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Configuration framework runtime
    /// </summary>
    public interface IConfigurationFrameworkRuntime
    {
        /// <summary>
        /// View mode (live/ready/latest)
        /// </summary>
        ConfigurationItemViewMode ViewMode { get; }

        /// <summary>
        /// Front-end application
        /// </summary>
        string? FrontEndApplication { get; }

        /// <summary>
        /// Current module (top level)
        /// </summary>
        string CurrentModule { get; }

        /// <summary>
        /// Current module (top level)
        /// </summary>
        string? CurrentModuleOrNull { get; }

        /// <summary>
        /// Begin runtime scope
        /// </summary>
        /// <param name="initAction">Initialization of the scope</param>
        /// <returns></returns>
        IDisposable BeginScope(Action<ConfigurationFrameworkRuntimeState> initAction);
    }
}
