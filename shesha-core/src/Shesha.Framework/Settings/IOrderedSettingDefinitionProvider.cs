namespace Shesha.Settings
{
    /// <summary>
    /// Setting definition provider
    /// </summary>
    public interface IOrderedSettingDefinitionProvider: ISettingDefinitionProvider
    {
        /// <summary>
        /// Order of the provider
        /// </summary>
        int OrderIndex { get; }
    }
}
