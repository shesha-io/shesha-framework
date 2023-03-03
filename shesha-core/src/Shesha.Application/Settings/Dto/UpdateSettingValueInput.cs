using Shesha.Domain;

namespace Shesha.Settings.Dto
{
    /// <summary>
    /// Update setting value input
    /// </summary>
    public class UpdateSettingValueInput : SettingIdentifier
    {
        /// <summary>
        /// Setting value
        /// </summary>
        public object Value { get; set; }
    }
}