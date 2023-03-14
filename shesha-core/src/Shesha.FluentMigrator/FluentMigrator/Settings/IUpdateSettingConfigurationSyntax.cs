namespace Shesha.FluentMigrator.Settings
{
    /// <summary>
    /// Update setting configuration syntax
    /// </summary>
    public interface IUpdateSettingConfigurationSyntax
    {
        /// <summary>
        /// Set description
        /// </summary>
        IUpdateSettingConfigurationSyntax SetDescription(string description);

        /// <summary>
        /// Mark setting as client specific
        /// </summary>
        IUpdateSettingConfigurationSyntax SetIsClientSpecific(bool value);

        /// <summary>
        /// Set custom edit for
        /// </summary>
        IUpdateSettingConfigurationSyntax SetEditForm(string module, string name);

        /// <summary>
        /// Set access mode
        /// </summary>
        IUpdateSettingConfigurationSyntax SetAccessMode(SettingAccessMode accessMode);

        /// <summary>
        /// Set category
        /// </summary>
        IUpdateSettingConfigurationSyntax SetCategory(string category);

        /// <summary>
        /// Set display name
        /// </summary>
        IUpdateSettingConfigurationSyntax SetDisplayName(string displayName);

        /// <summary>
        /// Set module name. By default it's set to a module current migration belongs to
        /// </summary>
        IUpdateSettingConfigurationSyntax OnModule(string moduleName);

        void SetValue(string value);
        void ResetValueToDefault();
        void SetValueForApplication(string appKey, string value);
    }
}
