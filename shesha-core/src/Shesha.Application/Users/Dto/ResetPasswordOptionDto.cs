using Shesha.Domain.Enums;

namespace Shesha.Users.Dto
{
    public class ResetPasswordOptionDto
    {
        public RefListPasswordResetMethods? Method { get; set; }

        public string Prompt { get; set; }

        public string MaskedIdentifier { get; set; }
    }
}
