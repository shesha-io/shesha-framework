using Shesha.Domain;

namespace Shesha.Settings.Dto
{
    /// <summary>
    /// Setting identifier, is used in the settings generic app service
    /// </summary>
    public class SettingIdentifierDto
    {
        /// <summary>
        /// Setting name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Module name
        /// </summary>
        public string Module { get; set; }
    }
 }