namespace Shesha.Users.Dto
{
    public class ResetPasswordValidateCodeInput
    {
        public string Code { get; set; }

        public string Username { get; set; }

        public long Method { get; set; }
    }
}
