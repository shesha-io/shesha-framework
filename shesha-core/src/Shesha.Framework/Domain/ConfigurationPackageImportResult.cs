using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;

namespace Shesha.Domain
{
    /// <summary>
    /// Configuration package import result
    /// </summary>
    [DiscriminatorValue("SheshaConfigPackageImportResult")]
    [SnakeCaseNaming]
    [Entity(CrudActions = CrudActions.Read, IsConfigurable = false)]
    public class ConfigurationPackageImportResult: ImportResult
    {
        /// <summary>
        /// Application startup assembly. Applicable for packages imported during application startup
        /// </summary>
        public virtual ApplicationStartupAssembly? ApplicationStartupAssembly { get; set; }
    }
}
