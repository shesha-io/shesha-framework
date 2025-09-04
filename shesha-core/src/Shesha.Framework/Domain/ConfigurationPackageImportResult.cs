using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    /// <summary>
    /// Configuration package import result
    /// </summary>
    [DiscriminatorValue("SheshaConfigPackageImportResult")]
    public class ConfigurationPackageImportResult: ImportResult
    {
    }
}
