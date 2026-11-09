using System;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.UserRegistrations
{
    /// <summary>
    /// Checks registrant email addresses against the configured list of allowed domains
    /// </summary>
    public static class EmailDomainPolicy
    {
        private static readonly char[] Separators = { ',', ';', ' ', '\t', '\r', '\n' };

        /// <summary>
        /// Parses a list such as "gov.za; @Example.com" into normalized domains ("gov.za", "example.com")
        /// </summary>
        public static IReadOnlyList<string> ParseDomains(string allowedDomains)
        {
            if (string.IsNullOrWhiteSpace(allowedDomains))
                return Array.Empty<string>();

            return allowedDomains
                .Split(Separators, StringSplitOptions.RemoveEmptyEntries)
                .Select(d => d.Trim().TrimStart('@').ToLowerInvariant())
                .Where(d => d.Length > 0)
                .Distinct()
                .ToList();
        }

        /// <summary>
        /// True when no domains are configured, or the email's domain exactly matches one of them (case-insensitive).
        /// Sub-domains must be listed explicitly so that e.g. "evil-gov.za" or "gov.za.evil.com" never match "gov.za".
        /// </summary>
        public static bool IsAllowed(string email, string allowedDomains)
        {
            var domains = ParseDomains(allowedDomains);
            if (domains.Count == 0)
                return true;

            var domain = GetDomain(email);
            return domain != null && domains.Contains(domain);
        }

        /// <summary>
        /// Returns the lower-cased domain of an email address, or null when the address has no single '@' with text on both sides
        /// </summary>
        public static string GetDomain(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return null;

            var trimmed = email.Trim();
            var at = trimmed.IndexOf('@');
            if (at <= 0 || at != trimmed.LastIndexOf('@') || at == trimmed.Length - 1)
                return null;

            return trimmed.Substring(at + 1).ToLowerInvariant();
        }
    }
}
