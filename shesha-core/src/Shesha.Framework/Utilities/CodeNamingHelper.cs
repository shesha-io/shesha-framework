using Shesha.Exceptions;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace Shesha.Utilities
{
    /// <summary>
    /// Helper for handling static code rules
    /// </summary>
    public static class CodeNamingHelper
    {
        /// <summary>
        /// Validate specified <paramref name="identifier"/>, throws <see cref="IdentifierIsNotValidException"/> if identifier is not valid
        /// </summary>
        /// <param name="identifier"></param>
        /// <exception cref="IdentifierIsNotValidException"></exception>
        public static void ValidateCodeIdentifier(string identifier)
        {
            if (!CSharpSyntaxHelper.IsValidIdentifier(identifier))
                throw new IdentifierIsNotValidException(identifier);
        }

        /// <summary>
        /// Get accessor (a valid code identifier) based on name and alias.
        /// If <paramref name="alias"/> is specified - validates it and return as is.
        /// If <paramref name="alias"/> is not specified - converts <paramref name="name"/> to camelCase and validates and returns.
        /// </summary>
        /// <param name="name"></param>
        /// <param name="alias"></param>
        /// <returns></returns>
        public static string GetAccessor(string name, string alias = null)
        {
            if (string.IsNullOrWhiteSpace(alias))
            {
                var accessor = CamelCaseHelper.Convert(name);

                ValidateCodeIdentifier(accessor);
                return accessor;
            }
            else
            {
                ValidateCodeIdentifier(alias);
                return alias;
            }
        }
    }
}