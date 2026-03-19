using Abp.Dependency;
using Shesha.Otp.Configuration;
using System;
using System.Security.Cryptography;

namespace Shesha.Otp
{
    public class OtpGenerator: IOtpGenerator, ITransientDependency
    {
        private readonly IOtpSettings _settings;

        public OtpGenerator(IOtpSettings settings)
        {
            _settings = settings;
        }

        public string GeneratePin()
        {
            var password = string.Empty;

            var alphabet = _settings.OneTimePins.GetValue().Alphabet;
            var passwordLength = _settings.OneTimePins.GetValue().PasswordLength;

            for (int i = 0; i < passwordLength; i++)
            {
                password += alphabet[RandomNumberGenerator.GetInt32(alphabet.Length)];
            }

            return password;
        }
    }
}
