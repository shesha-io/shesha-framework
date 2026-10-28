namespace Shesha.Settings.Dto
{
    /// <summary>
    /// Get setting values input
    /// </summary>
    public class GetSettingValuesInput
    {
        public SettingIdentifier[] Identifiers { get; set; }
    }
}