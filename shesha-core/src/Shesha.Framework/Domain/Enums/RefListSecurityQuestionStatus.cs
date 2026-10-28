using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Framework", "SecurityQuestionStatus")]
    public enum RefListSecurityQuestionStatus
    {
        NotApplicable = 1,
        Set = 2,
        NotSet = 3,
    }
}
