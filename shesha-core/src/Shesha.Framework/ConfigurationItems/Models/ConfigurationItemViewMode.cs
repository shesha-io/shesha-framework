using System.ComponentModel;

namespace Shesha.ConfigurationItems.Models
{
    /// <summary>
    /// Configuration item view mode. Is used to define the rules of configuration items visibility
    /// </summary>
    public enum ConfigurationItemViewMode
    {
        [Description("Display only live versions")]
        Live = 1,
        
        [Description("Display latest versions irrespectively of status")]
        Latest = 3,
    }
}
