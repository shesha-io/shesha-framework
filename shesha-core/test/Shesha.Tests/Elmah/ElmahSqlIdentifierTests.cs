using System;
using Shesha.Elmah;
using Xunit;

namespace Shesha.Tests.Elmah
{
    /// <summary>
    /// Pure unit tests for the SQL identifier whitelist that backs the Elmah
    /// SQL-injection fix. No database/Testcontainers required.
    /// </summary>
    public class ElmahSqlIdentifierTests
    {
        [Theory]
        [InlineData("elmah")]
        [InlineData("errors")]
        [InlineData("error_refs")]
        [InlineData("_leadingUnderscore")]
        [InlineData("Mixed_Case_123")]
        [InlineData("a")]
        public void Validate_returns_valid_identifiers_unchanged(string identifier)
        {
            Assert.Equal(identifier, ElmahSqlIdentifier.Validate(identifier));
        }

        [Theory]
        // SQL-injection payloads
        [InlineData("errors; DROP TABLE elmah.errors;--")]
        [InlineData("x' OR '1'='1")]
        [InlineData("errors]; DROP TABLE x;--")]
        [InlineData("a\"; DROP TABLE x;--")]
        // Structurally invalid identifiers
        [InlineData("1leadingDigit")]
        [InlineData("has space")]
        [InlineData("has-hyphen")]
        [InlineData("has.dot")]
        [InlineData("accenté")]
        // Newlines: .NET $ matches before a trailing \n, so these must be rejected by \A..\z
        [InlineData("errors\n")]
        [InlineData("errors\n; DROP TABLE x;--")]
        [InlineData("\nerrors")]
        [InlineData("")]
        [InlineData(null)]
        public void Validate_throws_for_invalid_or_malicious_identifiers(string identifier)
        {
            Assert.Throws<ArgumentException>(() => ElmahSqlIdentifier.Validate(identifier));
        }
    }
}
