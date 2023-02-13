using System.Linq;
using Moq;
using Shesha.Otp;
using Shesha.Otp.Configuration;
using Shouldly;
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

            settings.SetupGet(s => s.PasswordLength).Returns(length);
            settings.SetupGet(s => s.Alphabet).Returns(alphabet);

            var generator = new Shesha.Otp.OtpGenerator(settings.Object);

            var pass = generator.GeneratePin();

            pass.Length.ShouldBe(length);
            pass.All(c => alphabet.Contains(c)).ShouldBe(true);
        }
    }
}
