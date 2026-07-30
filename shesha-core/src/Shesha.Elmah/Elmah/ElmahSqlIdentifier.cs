using System;
using System.Text.RegularExpressions;

namespace Shesha.Elmah
{
    /// <summary>
    /// Validation helpers for SQL identifiers (schema/table names) that have to be embedded
    /// directly into DDL statements, where query parameters are not permitted.
    /// Shared by the SQL Server and PostgreSQL Elmah error-log providers so this
    /// security-critical logic cannot diverge between the two.
    /// </summary>
    public static class ElmahSqlIdentifier
    {
        // Only allow a leading letter/underscore followed by letters, digits or underscores.
        // Uses absolute anchors (\A ... \z) rather than ^/$ because in .NET $ also matches
        // immediately before a trailing newline, which would let "name\n" slip through.
        private static readonly Regex _identifierRegex = new Regex(@"\A[A-Za-z_][A-Za-z0-9_]*\z", RegexOptions.Compiled);

        /// <summary>
        /// Returns <paramref name="identifier"/> unchanged when it is a safe SQL identifier;
        /// otherwise throws <see cref="ArgumentException"/>. Prevents SQL injection via identifiers.
        /// </summary>
        public static string Validate(string identifier)
        {
            if (string.IsNullOrEmpty(identifier) || !_identifierRegex.IsMatch(identifier))
                throw new ArgumentException($"Invalid SQL identifier: '{identifier}'.", nameof(identifier));
            return identifier;
        }
    }
}
