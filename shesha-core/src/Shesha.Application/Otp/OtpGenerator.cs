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
            return GeneratePin(null, null);
        }

        public string GeneratePin(int? length, string? alphabet)
        {
            var password = string.Empty;

            if (string.IsNullOrEmpty(alphabet))
                alphabet = _settings.OneTimePins.GetValue().Alphabet;
            var passwordLength = length.HasValue && length.Value > 0
                ? length.Value
                : _settings.OneTimePins.GetValue().PasswordLength;

            for (int i = 0; i < passwordLength; i++)
            {
                password += alphabet[RandomNumberGenerator.GetInt32(alphabet.Length)];
            }

            return password;
        }
    }
}
