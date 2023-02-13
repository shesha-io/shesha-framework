using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [ReferenceList("Shesha.Core", "ImportSourceType")]
    public enum RefListImportSourceType
    {
        File = 1,
        Web = 2,
        Ftp = 3
    }
}
