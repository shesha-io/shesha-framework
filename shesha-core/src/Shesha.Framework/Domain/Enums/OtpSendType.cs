using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Framework", "OtpSendType")]
    public enum OtpSendType
    {
        Sms = 1,
        Email = 2,
        //Push = 3 todo: implement and uncomment
        EmailLink = 4
    }
}
