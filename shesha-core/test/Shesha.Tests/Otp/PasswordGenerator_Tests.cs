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

            var passwordLengthAccessor = new Mock<ISettingAccessor<int>>();
            passwordLengthAccessor.Setup(s => s.GetValue()).Returns(length);

            settings.SetupGet(s => s.OneTimePins.GetValue().PasswordLength).Returns(passwordLengthAccessor.Object.GetValue());

            var alphabetAccessor = new Mock<ISettingAccessor<string>>();
            alphabetAccessor.Setup(s => s.GetValue()).Returns(alphabet);
            settings.SetupGet(s => s.OneTimePins.GetValue().Alphabet).Returns(alphabetAccessor.Object.GetValue());


            var generator = new Shesha.Otp.OtpGenerator(settings.Object);

            var pass = generator.GeneratePin();

            pass.Length.ShouldBe(length);
            pass.All(c => alphabet.Contains(c)).ShouldBe(true);
        }
    }
}
