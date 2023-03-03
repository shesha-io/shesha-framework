namespace Shesha.Settings
{
    /// <summary>
    /// Setting definition provider
    /// </summary>
    public interface ISettingDefinitionProvider
    {
        /// <summary>
        /// Define settings
        /// </summary>
        /// <param name="context"></param>
        void Define(ISettingDefinitionContext context);
    }
}
