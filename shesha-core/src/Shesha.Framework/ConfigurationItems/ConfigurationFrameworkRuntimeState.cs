using Shesha.ConfigurationItems.Models;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Configuration Framework runtime state
    /// </summary>
    public class ConfigurationFrameworkRuntimeState
    {
        /// <summary>
        /// Front-end application
        /// </summary>
        public string? FrontEndApplication { get; set; }

        /// <summary>
        /// Current module (top level)
        /// </summary>
        public string? CurrentModule { get; set; }

        /// <summary>
        /// If true, indicates that configuration changes tracking is enabled and any changes made on the configuration items are treated as manual and tracked automatically
        /// </summary>
        public bool IsConfigurationTrackingEnabled { get; set; }

        public ConfigurationFrameworkRuntimeState()
        {
            IsConfigurationTrackingEnabled = true;
        }

        /// <summary>
        /// Create new state as a copy of existing one
        /// </summary>
        /// <param name="prevState"></param>
        public ConfigurationFrameworkRuntimeState(ConfigurationFrameworkRuntimeState prevState)
        {
            FrontEndApplication = prevState.FrontEndApplication;
            CurrentModule = prevState.CurrentModule;
            IsConfigurationTrackingEnabled = prevState.IsConfigurationTrackingEnabled;
        }
    }
}
