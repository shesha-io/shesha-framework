using Shesha.Domain;

namespace Shesha.Settings.Dto
{
    /// <summary>
    /// Dynamic setting Get setting value input
    /// </summary>
    public class GetDynamicSettingValueInput : GetSettingValueInput
    {
        /// <summary>
        /// Name of the type the setting value should be able to deserialise into
        /// </summary>
        public string Datatype { get; set; }

        /// <summary>
        /// that default value of the setting the first time it is accessed.
        /// </summary>
        public object DefaultValue { get; set; }
    }
}