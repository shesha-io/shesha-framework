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

            result.ShouldBe("Click <a href='https://app.example/no-auth/shesha/email-link-verification/?token={{token}}&amp;operationId={{operationId}}&amp;isRegistration=true&identifier={{userid}}'>here</a>");
        }

        [Fact]
        public void The_default_templates_have_no_raw_ampersands()
        {
            OtpManager.EscapeAmpersands(OtpDefaults.DefaultEmailBodyTemplate).ShouldBe(OtpDefaults.DefaultEmailBodyTemplate);
        }

        [Fact]
        public void Raw_ampersands_in_a_saved_template_are_escaped()
        {
            // "&reg" is read as the ® entity by mail clients, so "&registration=1" arrived as "®istration=1"
            var saved = "<a href='https://app.example/?token={{token}}&identifier={{userid}}&operationId={{operationId}}&registration=1'>link</a>";

            OtpManager.EscapeAmpersands(saved)
                .ShouldBe("<a href='https://app.example/?token={{token}}&amp;identifier={{userid}}&amp;operationId={{operationId}}&amp;registration=1'>link</a>");
        }

        [Theory]
        [InlineData("Terms &amp; conditions")]
        [InlineData("Hello&nbsp;there")]
        [InlineData("Tom &#38; Jerry")]
        [InlineData("Tom &#x26; Jerry")]
        public void Existing_character_references_are_left_alone(string html)
        {
            OtpManager.EscapeAmpersands(html).ShouldBe(html);
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        public void Empty_templates_are_left_alone(string? html)
        {
            OtpManager.EscapeAmpersands(html!).ShouldBe(html);
        }

        [Fact]
        public void The_default_template_is_unchanged()
        {
            OtpManager.AddRegistrationLinkParameters(OtpDefaults.DefaultEmailBodyTemplate)
                .ShouldBe(OtpDefaults.DefaultEmailBodyTemplate);
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("A template with no link")]
        public void Templates_without_a_token_are_unchanged(string? template)
        {
            OtpManager.AddRegistrationLinkParameters(template!).ShouldBe(template);
        }
    }
}
