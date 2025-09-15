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
    }
}
