using System;
using Abp.Dependency;
using Shesha.Otp.Configuration;

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
            var random = new Random();
            var password = string.Empty;

            for (int i = 0; i < _settings.PasswordLength; i++)
            {
                password += _settings.Alphabet[random.Next(_settings.Alphabet.Length)];
            }

            return password;
        }
    }
}
