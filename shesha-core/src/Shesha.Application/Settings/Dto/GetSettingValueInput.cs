using Shesha.Domain;

namespace Shesha.Settings.Dto
{
    /// <summary>
    /// Get setting value input
    /// </summary>
    public class GetSettingValueInput : SettingIdentifierDto
    {
        /// <summary>
        /// Front-end application key, see <seealso cref="FrontEndApp.AppKey"/>. Is used for client-specific applications only.
        /// NOTE: this parameter if optional with fallback to the `sha-frontend-application` header
        /// </summary>
        public string AppKey { get; set; }

        /// <summary>
        /// User Id. Is used for user-specific settings only.
        /// </summary>
        public long? UserId { get; set; }
    }
}