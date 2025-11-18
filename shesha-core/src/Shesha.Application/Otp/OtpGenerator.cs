using System;
using System.Text;
using Abp.Dependency;
using Shesha.Configuration.Security.Frontend;

namespace Shesha.Otp
{
    public class OtpGenerator: IOtpGenerator, ITransientDependency
    {
        private readonly IUserManagementSettings _userManagementSettings;

        public OtpGenerator(IUserManagementSettings userManagementSettings)
        {
            _userManagementSettings = userManagementSettings;
        }

        public string GeneratePin()
        {
            var random = new Random();
            var password = new StringBuilder();

            var alphabet = _userManagementSettings.DefaultAuthentication.GetValue().Alphabet;
            var passwordLength = _userManagementSettings.DefaultAuthentication.GetValue().PasswordLength;

            for (int i = 0; i < passwordLength; i++)
            {
                password.Append(alphabet[random.Next(alphabet.Length)]);
            }

            return password.ToString();
        }
    }
}
