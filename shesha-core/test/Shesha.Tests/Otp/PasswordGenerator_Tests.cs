using Moq;
using Shesha.Otp.Configuration;
using Shesha.Settings;
using Shouldly;
using System.Linq;
using Xunit;

namespace Shesha.Tests.Otp
{
    public class PasswordGenerator_Tests
    {
        [Theory]
        [InlineData("0123456789", 4)]
        [InlineData("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6)]
        public void GeneratePassword_Test(string alphabet, int length)
        {
            var settings = new Mock<IOtpSettings>();

            var otpSettings = new OtpSettings {
                Alphabet = alphabet,
                PasswordLength = length,
            };
            var otpSettingsMock = new Mock<ISettingAccessor<OtpSettings>>();
            otpSettingsMock.Setup(s => s.GetValueOrNull(null)).Returns(otpSettings);
            otpSettingsMock.Setup(s => s.GetValue(null)).Returns(otpSettings);

            settings.SetupGet(s => s.OneTimePins).Returns(otpSettingsMock.Object);

            var generator = new Shesha.Otp.OtpGenerator(settings.Object);

            var pass = generator.GeneratePin();

            pass.Length.ShouldBe(length);
            pass.All(c => alphabet.Contains(c)).ShouldBe(true);
        }
    }
}
