using Shesha.ConfigurationItems.Models;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Configuration Framework runtime state
    /// </summary>
    public class ConfigurationFrameworkRuntimeState
    {
        /// <summary>
        /// View mode
        /// </summary>
        public ConfigurationItemViewMode ViewMode { get; set; }

        /// <summary>
        /// Front-end application
        /// </summary>
        public string FrontEndApplication { get; set; }
    }
}
