using Shesha.Domain;

namespace Shesha.Settings.Dto
{
    /// <summary>
    /// Setting identifier, is used in the settings generic app service
    /// </summary>
    public class SettingIdentifier
    {
        /// <summary>
        /// Setting name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Module name
        /// </summary>
        public string Module { get; set; }

        /// <summary>
        /// Front-end application key, see <seealso cref="FrontEndApp.AppKey"/>. Is used for client-specific applications only
        /// </summary>
        public string AppKey { get; set; }
    }
}