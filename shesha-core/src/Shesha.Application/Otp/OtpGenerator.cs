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

            var authSettings = _userManagementSettings.SqlAuthentication.GetValue();
            var alphabet = authSettings.Alphabet;
            var passwordLength = authSettings.PasswordLength;

            for (int i = 0; i < passwordLength; i++)
            {
                password.Append(alphabet[random.Next(alphabet.Length)]);
            }

            return password.ToString();
        }
    }
}
