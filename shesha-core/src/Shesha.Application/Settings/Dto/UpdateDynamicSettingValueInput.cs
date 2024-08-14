using Shesha.Domain;

namespace Shesha.Settings.Dto
{
    /// <summary>
    /// Dynamic setting Get setting value input
    /// </summary>
    public class UpdateDynamicSettingValueInput: UpdateSettingValueInput
    {
        /// <summary>
        /// Name of the type the setting value should be able to deserialise into
        /// </summary>
        public string Datatype { get; set; }

    }
}