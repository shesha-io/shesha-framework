using System.Linq;
using System.Text.RegularExpressions;

namespace Shesha.Utilities
{
    /// <summary>
    /// camelCase and PascalCase helper. Partial port of the nodejs camelcase package (npm: https://www.npmjs.com/package/camelcase, GitHub: https://github.com/sindresorhus/camelcase)
    /// </summary>
    public static class CamelCaseHelper
    {
        private static Regex UPPERCASE = new Regex(@"[\p{Lu}]");
        private static Regex LOWERCASE = new Regex(@"[\p{Ll}]");
        private static Regex LEADING_CAPITAL = new Regex(@"^[\p{Lu}](?![\p{Lu}])");
        private static Regex SEPARATORS = new Regex(@"[_.\- ]+");
        private static Regex LEADING_SEPARATORS = new Regex(@"^[_.\- ]+");

        // Generated from: Uppercase + Lowercase + Lt + Lm + Lo + Nl + Other_Alphabetic
        private static Regex IDENTIFIER = new Regex(@"([\p{L}\p{Nl}\p{N}_]|$)", RegexOptions.ECMAScript);
        private static Regex SEPARATORS_AND_IDENTIFIER = new Regex(@"[_.\- ]+(?<identifier>[\p{L}\p{Nl}\p{N}_]|$)");
        private static Regex NUMBERS_AND_IDENTIFIER = new Regex(@"\d+([\p{L}\p{Nl}\p{N}_]|$)");

        public static string Convert(string input) 
        {
            return Convert(input, new ConvertOptions { PascalCase = false, PreserveConsecutiveUppercase = false, KeepLeadingSeparators = false });
        }

        public static string Convert(string input, ConvertOptions options)
        {
            if (string.IsNullOrWhiteSpace((string)input))
                return "";

            input = input.Trim();
            if (input.Length == 0)
                return "";

            if (input.Length == 1)
            {
                if (SEPARATORS.IsMatch((string)input))
                    return "";

                return options.PascalCase ? input.ToUpper() : input.ToLower();
            }

            var hasUpperCase = input != input.ToLower();

            if (hasUpperCase)
                input = PreserveCamelCase(input, options.PreserveConsecutiveUppercase);
            
            var leadingSeparators = options.KeepLeadingSeparators
                ? LEADING_SEPARATORS.Match(input).Value
                : "";

            input = LEADING_SEPARATORS.Replace(input, "");
	        input = options.PreserveConsecutiveUppercase 
                ? PreserveConsecutiveUppercase(input) 
                : input.ToLower();

            if (options.PascalCase && input.Length > 0) {
                input = char.ToUpper(input[0]) + (input.Length > 1 ? input.Substring(1, input.Length - 1) : "");
            }

            var result = PostProcess(input);
            return string.IsNullOrEmpty(result) ? string.Empty : leadingSeparators + result;
        }

        private static char? CharAt(string input, int position) 
        { 
            return position >= 0 && position < input.Length
                ? input[position] : null;
        }

        private static string PostProcess(string input) 
        {
            var delimiters = new char[] { '_', '-' };
            input = NUMBERS_AND_IDENTIFIER.Replace(input, (m) => {
                var nextChar = CharAt(input, m.Index + m.Length);
                return nextChar.HasValue && delimiters.Contains(nextChar.Value) ? m.Value : m.Value.ToUpper();
            });

            input = SEPARATORS_AND_IDENTIFIER.Replace(input, m => {
                var identifier = m.Groups["identifier"];
                return identifier.Value.ToUpper();
            });

            return input;
        }

        private static string PreserveConsecutiveUppercase(string input) 
        {
            return LEADING_CAPITAL.Replace(input, m => m.Value.ToLower());
        }

        private static string PreserveCamelCase(string input, bool preserveConsecutiveUppercase)
        {
            var isLastCharLower = false;
            var isLastCharUpper = false;
            var isLastLastCharUpper = false;
            var isLastLastCharPreserved = false;

            for (var index = 0; index < input.Length; index++)
            {
                var character = input[index].ToString();
                isLastLastCharPreserved = index > 2 ? input[index - 3] == '-' : true;

                if (isLastCharLower && UPPERCASE.IsMatch(character))
                {
                    input = input.Substring(0, index) + '-' + input.Substring(index);
                    isLastCharLower = false;
                    isLastLastCharUpper = isLastCharUpper;
                    isLastCharUpper = true;
                    index++;
                }
                else if (isLastCharUpper && isLastLastCharUpper && LOWERCASE.IsMatch(character) && (!isLastLastCharPreserved || preserveConsecutiveUppercase))
                {
                    input = input.Substring(0, index - 1) + '-' + input.Substring(index - 1);
                    isLastLastCharUpper = isLastCharUpper;
                    isLastCharUpper = false;
                    isLastCharLower = true;
                }
                else
                {
                    isLastCharLower = character.ToLower() == character && character.ToUpper() != character;
                    isLastLastCharUpper = isLastCharUpper;
                    isLastCharUpper = character.ToUpper() == character && character.ToLower() != character;
                }
            }

            return input;
        }

        public class ConvertOptions 
        {
            /// <summary>
            /// NOTE! The camelCase and PascalCase standards remove the leading separators. Use this option with caution.
            /// </summary>
            public bool KeepLeadingSeparators { get; set; }
            public bool PascalCase { get; set; }
            public bool PreserveConsecutiveUppercase { get; set; }
        }
    }
}
