using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    /// <summary>
    /// Configuration package import result
    /// </summary>
    [DiscriminatorValue("SheshaConfigPackageImportResult")]
    [SnakeCaseNaming]
    public class ConfigurationPackageImportResult: ImportResult
    {
        /// <summary>
        /// Application startup assembly. Applicable for packages imported during application startup
        /// </summary>
        public virtual ApplicationStartupAssembly? ApplicationStartupAssembly { get; set; }
    }
}
