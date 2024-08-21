using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace Shesha.Utilities
{
    public static class CSharpSyntaxHelper
    {
        // definition of a valid C# identifier: http://msdn.microsoft.com/en-us/library/aa664670(v=vs.71).aspx
        private const string FORMATTING_CHARACTER = @"\p{Cf}";
        private const string CONNECTING_CHARACTER = @"\p{Pc}";
        private const string DECIMAL_DIGIT_CHARACTER = @"\p{Nd}";
        private const string COMBINING_CHARACTER = @"\p{Mn}|\p{Mc}";
        private const string LETTER_CHARACTER = @"\p{Lu}|\p{Ll}|\p{Lt}|\p{Lm}|\p{Lo}|\p{Nl}";

        private const string IDENTIFIER_PART_CHARACTER = LETTER_CHARACTER + "|" +
                                                         DECIMAL_DIGIT_CHARACTER + "|" +
                                                         CONNECTING_CHARACTER + "|" +
                                                         COMBINING_CHARACTER + "|" +
                                                         FORMATTING_CHARACTER;

        private const string IDENTIFIER_PART_CHARACTERS = "(" + IDENTIFIER_PART_CHARACTER + ")+";
        private const string IDENTIFIER_START_CHARACTER = "(" + LETTER_CHARACTER + "|_)";

        private const string IDENTIFIER_OR_KEYWORD = IDENTIFIER_START_CHARACTER + "(" +
                                                     IDENTIFIER_PART_CHARACTERS + ")*";

        // C# keywords: http://msdn.microsoft.com/en-us/library/x53a06bb(v=vs.71).aspx
        private static readonly HashSet<string> _keywords = new HashSet<string>
    {
        "__arglist",    "__makeref",    "__reftype",    "__refvalue",
        "abstract",     "as",           "base",         "bool",
        "break",        "byte",         "case",         "catch",
        "char",         "checked",      "class",        "const",
        "continue",     "decimal",      "default",      "delegate",
        "do",           "double",       "else",         "enum",
        "event",        "explicit",     "extern",       "false",
        "finally",      "fixed",        "float",        "for",
        "foreach",      "goto",         "if",           "implicit",
        "in",           "int",          "interface",    "internal",
        "is",           "lock",         "long",         "namespace",
        "new",          "null",         "object",       "operator",
        "out",          "override",     "params",       "private",
        "protected",    "public",       "readonly",     "ref",
        "return",       "sbyte",        "sealed",       "short",
        "sizeof",       "stackalloc",   "static",       "string",
        "struct",       "switch",       "this",         "throw",
        "true",         "try",          "typeof",       "uint",
        "ulong",        "unchecked",    "unsafe",       "ushort",
        "using",        "virtual",      "volatile",     "void",
        "while"
    };

        private static readonly Regex _validIdentifierRegex = new Regex("^" + IDENTIFIER_OR_KEYWORD + "$", RegexOptions.Compiled);

        public static bool IsValidIdentifier(this string identifier)
        {
            if (string.IsNullOrWhiteSpace(identifier)) return false;

            var normalizedIdentifier = identifier.Normalize();

            // 1. check that the identifier match the validIdentifer regex and it's not a C# keyword
            if (_validIdentifierRegex.IsMatch(normalizedIdentifier) && !_keywords.Contains(normalizedIdentifier))
            {
                return true;
            }

            // 2. check if the identifier starts with @
            if (normalizedIdentifier.StartsWith("@") && _validIdentifierRegex.IsMatch(normalizedIdentifier.Substring(1)))
            {
                return true;
            }

            // 3. it's not a valid identifier
            return false;
        }
    }
}
