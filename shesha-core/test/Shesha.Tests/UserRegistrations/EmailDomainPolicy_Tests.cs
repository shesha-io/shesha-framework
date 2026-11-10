using Shesha.UserRegistrations;
using Shouldly;
using Xunit;

namespace Shesha.Tests.UserRegistrations
{
    public class EmailDomainPolicy_Tests
    {
        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        public void Empty_list_allows_any_domain(string allowed)
        {
            EmailDomainPolicy.IsAllowed("someone@anywhere.org", allowed).ShouldBeTrue();
        }

        [Theory]
        [InlineData("jane@gov.za")]
        [InlineData("JANE@GOV.ZA")]
        [InlineData("  jane@Gov.Za  ")]
        [InlineData("jane@example.com")]
        public void Listed_domains_are_allowed_case_insensitively(string email)
        {
            EmailDomainPolicy.IsAllowed(email, "gov.za, @Example.com").ShouldBeTrue();
        }

        [Theory]
        [InlineData("jane@evil-gov.za")]
        [InlineData("jane@gov.za.evil.com")]
        [InlineData("jane@sub.gov.za")]
        [InlineData("gov.za@evil.com")]
        [InlineData("jane@evil.com")]
        public void Look_alike_and_unlisted_domains_are_rejected(string email)
        {
            EmailDomainPolicy.IsAllowed(email, "gov.za").ShouldBeFalse();
        }

        [Theory]
        [InlineData(null)]
        [InlineData("not-an-email")]
        [InlineData("@gov.za")]
        [InlineData("jane@")]
        [InlineData("jane@x@gov.za")]
        public void Malformed_addresses_are_rejected_when_domains_are_restricted(string email)
        {
            EmailDomainPolicy.IsAllowed(email, "gov.za").ShouldBeFalse();
        }

        [Fact]
        public void Domains_can_be_separated_by_commas_semicolons_and_whitespace()
        {
            EmailDomainPolicy.ParseDomains("a.com;b.com, c.com\r\n d.com  a.com")
                .ShouldBe(new[] { "a.com", "b.com", "c.com", "d.com" });
        }
    }
}
