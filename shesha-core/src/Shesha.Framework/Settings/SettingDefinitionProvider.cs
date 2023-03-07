namespace Shesha.Settings
{
    /// <summary>
    /// Setting definition provider
    /// </summary>
    public abstract class SettingDefinitionProvider : ISettingDefinitionProvider
    {
        public abstract void Define(ISettingDefinitionContext context);        
    }
}
