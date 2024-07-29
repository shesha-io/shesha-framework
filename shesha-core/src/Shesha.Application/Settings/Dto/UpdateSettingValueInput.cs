using Shesha.Domain;

namespace Shesha.Settings.Dto
{
    /// <summary>
    /// Update setting value input
    /// </summary>
    public class UpdateSettingValueInput : SettingIdentifierDto
    {
        /// <summary>
        /// Setting value
        /// </summary>
        public object Value { get; set; }

        /// <summary>
        /// Front-end application key, see <seealso cref="FrontEndApp.AppKey"/>. Is used for client-specific applications only
        /// </summary>
        public string AppKey { get; set; }

        /// <summary>
        /// User Id. Is used for user-specific settings only.
        /// </summary>
        public long? UserId { get; set; }
    }
}