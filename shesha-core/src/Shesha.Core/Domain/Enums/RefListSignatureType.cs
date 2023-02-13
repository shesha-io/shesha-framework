using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Core", "SignatureType")]
    public enum RefListSignatureType
    {
        None = 1,
        Default = 2,
        Actual = 3
    }
}
