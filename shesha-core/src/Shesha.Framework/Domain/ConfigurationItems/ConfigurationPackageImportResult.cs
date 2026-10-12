using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;

namespace Shesha.Domain.ConfigurationItems
{
    /// <summary>
    /// Configuration package import result
    /// </summary>
    [DiscriminatorValue("SheshaConfigPackageImportResult")]
    [Entity(CrudActions = CrudActions.Read, IsConfigurable = false)]
    public class ConfigurationPackageImportResult: ImportResult
    {
    }
}
