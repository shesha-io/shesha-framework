namespace Shesha.FluentMigrator.Settings
{
    /// <summary>
    /// Delete setting configuration syntax
    /// </summary>
    public interface IDeleteSettingConfigurationSyntax
    {
        /// <summary>
        /// Specify module name
        /// </summary>
        IDeleteSettingConfigurationSyntax FromModule(string module);
    }
}
