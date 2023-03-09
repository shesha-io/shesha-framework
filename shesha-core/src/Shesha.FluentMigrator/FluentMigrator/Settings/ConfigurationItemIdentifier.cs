namespace Shesha.FluentMigrator.Settings
{
    /// <summary>
    /// Configuration item identifier
    /// </summary>
    public class ConfigurationItemIdentifier
    {
        /// <summary>
        /// Item name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Module name
        /// </summary>
        public string Module { get; set; }

        public ConfigurationItemIdentifier(string module, string name)
        {
            Module = module;
            Name = name;
        }
    }
}
