using System;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Configuration framework runtime
    /// </summary>
    public interface IConfigurationFrameworkRuntime
    {
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
        /// If true, indicates that configuration changes tracking is enabled and any changes made on the configuration items are treated as manual and tracked automatically
        /// </summary>
        bool IsConfigurationTrackingEnabled { get; }

        /// <summary>
        /// Begin runtime scope
        /// </summary>
        /// <param name="initAction">Initialization of the scope</param>
        /// <returns></returns>
        IDisposable BeginScope(Action<ConfigurationFrameworkRuntimeState> initAction);

        /// <summary>
        /// Disable configuration changes tracking. By default the application collects all changes made to configuration items and triggers auto generation of revisions.
        /// This method can be used to disable this feature for specific cases (e.g. importing configuration items).
        /// </summary>
        IDisposable DisableConfigurationTracking();
    }
}
