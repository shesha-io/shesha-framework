using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.StringHelper
{
    public class StringHelperIsValidEmailTests
    {
        [Theory]
        [InlineData("rob@test.com", true)]
        [InlineData("rob@test.africa", true)]
        [InlineData("rob+dep@test.africa", true)]
        //Invalid email addresses
        [InlineData("rob", false)]
        [InlineData("rob@", false)]
        [InlineData("rob@.com", false)]
        [InlineData("rob@com", false)]
        [InlineData("@test.com", false)]
        [InlineData("rob@test.com ", false)]
        [InlineData(" rob@test.com", false)]
        [InlineData("rob@test .com", false)]
        [InlineData("", false)]
        [InlineData(" ", false)]
        [InlineData(null, false)]

        public void Should_Validate_Email_Addresses(string email, bool expected)
        {
            var result = Shesha.Utilities.StringHelper.IsValidEmail(email);

            Assert.Equal(expected, result);
        }
    }
}
