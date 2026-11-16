using Shesha.Otp;
using Shesha.Otp.Configuration;
using Shouldly;
using Xunit;

namespace Shesha.Tests.UserRegistrations
{
    public class RegistrationEmailLink_Tests
    {
        [Fact]
        public void A_saved_template_without_the_operation_id_gets_it_after_the_token()
        {
            var saved = "Click <a href='https://app.example/no-auth/shesha/email-link-verification/?token={{token}}&identifier={{userid}}'>here</a>";

            var result = OtpManager.AddRegistrationLinkParameters(saved);

            result.ShouldBe("Click <a href='https://app.example/no-auth/shesha/email-link-verification/?token={{token}}&operationId={{operationId}}&registration=1&identifier={{userid}}'>here</a>");
        }

        [Fact]
        public void The_default_template_is_unchanged()
        {
            OtpManager.AddRegistrationLinkParameters(OtpDefaults.DefaultRegistrationEmailBodyTemplate)
                .ShouldBe(OtpDefaults.DefaultRegistrationEmailBodyTemplate);
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("A template with no link")]
        public void Templates_without_a_token_are_unchanged(string template)
        {
            OtpManager.AddRegistrationLinkParameters(template).ShouldBe(template);
        }
    }
}
