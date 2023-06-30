using Abp.Localization;
using HtmlAgilityPack;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;

namespace Shesha.Utilities
{
    public enum ProcessDirection
    {
        LeftToRight,
        RightToLeft
    }

    /// <summary>
    /// Summary description for StringHelper.
    /// </summary>
    public static class StringHelper
    {

        public static string ToNullIsWhiteSpace(this string value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value;
        }

        /// <summary>
        /// Returns first not empty string from the specified <paramref name="values"/>
        /// </summary>
        /// <param name="values">List of strings</param>
        public static string FirstNotEmpty(params string[] values) 
        {
            return values.FirstOrDefault(v => !string.IsNullOrWhiteSpace(v));
        }

        /// <summary>
        /// Get localized text
        /// </summary>
        /// <param name="name">Text to localize</param>
        /// <param name="localizationSourceName">Localization source name (SheshaConsts.LocalizationSourceName = "Shesha" by default)</param>
        /// <returns></returns>
        public static ILocalizableString L(this string name, string localizationSourceName = SheshaConsts.LocalizationSourceName)
        {
            return new LocalizableString(name ?? "", localizationSourceName);
        }

        /// <summary>
        /// Remove common diacritics (accents) from a string (eg - Ë to E)
        /// </summary>
        /// <param name="value">Text to translate</param>
        /// <returns></returns>
        public static string RemoveDiacritics(this string value)
        {
            var normalizedString = value.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder();

            foreach (var c in normalizedString)
            {
                var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }

            return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
        }

        /// <summary>
        /// Returns the first few characters in the string.
        /// </summary>
        /// <param name="value">String from which characters must be extracted.</param>
        /// <param name="length">Number of characters to be returned.</param>
        /// <returns>Returns the first few characters in the string.</returns>
        public static string Left(this string value, int length)
        {
            return Left(value, length, false);
        }

        public static string Left(this string value, int length, bool showElipsis)
        {
            if (string.IsNullOrWhiteSpace(value))
                return "";
            else if (value.Length > length)
            {
                if (showElipsis)
                    return value.Substring(0, length - 3) + "...";
                else
                    return value.Substring(0, length);
            }
            else
                return value;
        }

        /// <summary>
        /// Returns the last few characters in the string.
        /// </summary>
        /// <param name="value">String from which characters must be extracted.</param>
        /// <param name="length">Number of characters to be returned.</param>
        /// <returns>Returns the last few characters in the string.</returns>
        public static string Right(this string value, int length)
        {
            if (string.IsNullOrWhiteSpace(value))
                return "";

            length = (length < value.Length) ? length : value.Length;

            return value.Substring(value.Length - length, length);
        }

        /// <summary>
        /// Goes through a string and capitalises the first letter of all the words found.
        /// </summary>
        /// <param name="value">String to be capitalised.</param>
        /// <returns>Returns a capitalised string.</returns>
        public static string CapitalizeWords(this string value)
        {
            return CapitalizeWords(value, c => Char.IsWhiteSpace(c));
        }

        public static string CapitalizeWords(this string value, Func<char, bool> isDelimiterFunc)
        {
            if (string.IsNullOrWhiteSpace(value))
                return "";

            var result = new StringBuilder(value);
            result[0] = Char.ToUpper(result[0]);
            for (int i = 1; i < result.Length; ++i)
            {
                if (isDelimiterFunc.Invoke(result[i - 1]))
                    result[i] = Char.ToUpper(result[i]);
                else
                    result[i] = Char.ToLower(result[i]);
            }
            return result.ToString();
        }

        public static string CapitalizeFirstChar(this string s)
        {
            if (s == null)
                return null;

            if (s.Length == 0)
                return string.Empty;

            char[] a = s.ToCharArray();
            a[0] = char.ToUpper(a[0]);
            return new string(a);
        }

        public static string DecapitalizeFirstChar(this string s)
        {
            if (s == null)
                return null;

            if (s.Length == 0)
                return string.Empty;

            char[] a = s.ToCharArray();
            a[0] = char.ToLower(a[0]);
            return new string(a);
        }

        /// <summary>
        /// Return friendly name of enum item by adding space prior to each capital letter except first letter
        /// </summary>
        /// <param name="itemName"></param>
        /// <returns></returns>
        public static string ToFriendlyName(this string itemName)
        {
            return itemName == null 
                ? "" 
                : Regex.Replace(itemName, "([a-z])([A-Z])", "$1 $2");
        }

        /// <summary>
        /// Replace all tags in specified string by tags values.
        /// </summary>
        /// <param name="value">string where we need to replace tags</param>
        /// <param name="tags">dictionary like tag=value</param>
        /// <returns></returns>
        public static string ReplaceTags(this string value, Dictionary<string, string> tags)
        {
            return String.IsNullOrEmpty(value) ? value : tags.Aggregate(value, (current, tag) => current.Replace(tag.Key, tag.Value));
        }

        public static string LeftPart(this string value, char delimiter, ProcessDirection direction)
        {
            var idx = direction == ProcessDirection.RightToLeft ? value.LastIndexOf(delimiter) : value.IndexOf(delimiter);
            return idx < 0 ? value : value.Left(idx);
        }
        public static string LeftPart(this string value, char delimiter)
        {
            return value.LeftPart(delimiter, ProcessDirection.LeftToRight);
        }

        public static string RightPart(this string value, char delimiter, ProcessDirection direction)
        {
            var idx = direction == ProcessDirection.RightToLeft ? value.LastIndexOf(delimiter) : value.IndexOf(delimiter);
            return idx < 0 ? value : value.Right(value.Length - idx - 1);
        }
        public static string RightPart(this string value, char delimiter)
        {
            return value.RightPart(delimiter, ProcessDirection.RightToLeft);
        }

        public static string Delimited(this IEnumerable<string> list, string delimiter)
        {
            if (!list.Any())
                return String.Empty;

            var res = String.Empty;

            foreach (var item in list)
            {
                res += (String.IsNullOrWhiteSpace(res) ? String.Empty : delimiter) + item ?? String.Empty;
            }
            return res;
        }

        #region from SocialCrm V2
        private static readonly Regex WebUrlExpression = new Regex(@"(http|https)://([\w-]+\.)+[\w-]+(/[\w- ./?%&=]*)?", RegexOptions.Singleline | RegexOptions.Compiled);
        private static readonly Regex EmailExpression = new Regex(@"^([0-9a-zA-Z]+[-._+&])*[0-9a-zA-Z]+@([-0-9a-zA-Z]+[.])+[a-zA-Z]{2,6}$", RegexOptions.Singleline | RegexOptions.Compiled);
        private static readonly Regex StripHTMLExpression = new Regex("<\\S[^><]*>", RegexOptions.IgnoreCase | RegexOptions.Singleline | RegexOptions.Multiline | RegexOptions.CultureInvariant | RegexOptions.Compiled);
        private static readonly Regex StripHTMLStyleExpression = new Regex("\\<style[^<]*\\<\\/style\\>", RegexOptions.IgnoreCase | RegexOptions.Singleline | RegexOptions.Multiline | RegexOptions.CultureInvariant | RegexOptions.Compiled);


        private static readonly char[] IllegalUrlCharacters = new[] { ';', '/', '\\', '?', ':', '@', '&', '=', '+', '$', ',', '<', '>', '#', '%', '.', '!', '*', '\'', '"', '(', ')', '[', ']', '{', '}', '|', '^', '`', '~', '–', '‘', '’', '“', '”', '»', '«' };

        [DebuggerStepThrough]
        public static bool IsEmail(this string target)
        {
            return !String.IsNullOrEmpty(target) && EmailExpression.IsMatch(target);
        }

        /// <summary>
        /// Convert string to Guid. Returns Guid.Empty if the string is in incorrect format
        /// </summary>
        [DebuggerStepThrough]
        public static Guid ToGuid(this string value)
        {
            return value.ToGuidOrNull() ?? Guid.Empty;
        }

        /// <summary>
        /// Convert string to Guid or null. Returns null if the string is in incorrect format
        /// </summary>
        [DebuggerStepThrough]
        public static Guid? ToGuidOrNull(this string value)
        {
            return Guid.TryParse(value?.Trim('{', '}'), out var result)
                ? result
                : (Guid?)null;
        }

        [DebuggerStepThrough]
        public static T ToEnum<T>(this string target, T defaultValue) where T : IComparable, IFormattable
        {
            T convertedValue = defaultValue;

            if (!String.IsNullOrEmpty(target))
            {
                try
                {
                    convertedValue = (T)Enum.Parse(typeof(T), target.Trim(), true);
                }
                catch (ArgumentException)
                {
                }
            }

            return convertedValue;
        }

        [DebuggerStepThrough]
        public static string UrlEncode(this string target)
        {
            return HttpUtility.UrlEncode(target);
        }

        [DebuggerStepThrough]
        public static string UrlDecode(this string target)
        {
            return HttpUtility.UrlDecode(target);
        }

        [DebuggerStepThrough]
        public static string AttributeEncode(this string target)
        {
            return HttpUtility.HtmlAttributeEncode(target);
        }

        [DebuggerStepThrough]
        public static string HtmlEncode(this string target)
        {
            return HttpUtility.HtmlEncode(target);
        }

        [DebuggerStepThrough]
        public static string HtmlDecode(this string target)
        {
            return HttpUtility.HtmlDecode(target);
        }

        public static string Replace(this string target, ICollection<string> oldValues, string newValue)
        {
            foreach (var oldValue in oldValues)
            {
                target = target.Replace(oldValue, newValue);
            }
            return target;
        }

        #endregion

        /// <summary>
        /// Returns the value of the first element which is not null or empty or white spaces.
        /// </summary>
        /// <param name="args">Strings from which to return the first available string.</param>
        /// <returns>Returns the value of the first element which is not null or empty or white spaces. If all
        /// the strings are null, empty or whitespaces, null is returned.</returns>
        public static string FirstValue(params string[] args)
        {
            for (int i = 0; i < args.Length; i++)
            {
                if (!String.IsNullOrWhiteSpace(args[i]))
                    return args[i];
            }
            return null;
        }

        /// <summary>
        /// Formats file size
        /// </summary>
        /// <param name="size">Siza in bytes</param>
        /// <param name="decimalPlaces">Decimal places (default value = 2)</param>
        /// <returns></returns>
	    public static string FormatFileSize(this int size, int decimalPlaces = 2)
        {
            return ((Int64)size).FormatFileSize(decimalPlaces);
        }

        /// <summary>
        /// Formats file size
        /// </summary>
        /// <param name="size">Siza in bytes</param>
        /// <param name="decimalPlaces">Decimal places (default value = 2)</param>
        /// <returns></returns>
        public static string FormatFileSize(this Int64 size, int decimalPlaces = 2)
        {
            double s = size;

            var kb = 1024;
            var mb = kb * 1024;
            var gb = mb * 1024;

            if (size >= gb)
            {
                return Math.Round(s / gb, decimalPlaces) + " GB";
            }
            if (size >= kb)
            {
                return Math.Round(s / mb, decimalPlaces) + " MB";
            }
            return Math.Round(s / kb, decimalPlaces) + " KB";
        }

        public static string NumberToWords(this int number)
        {
            if (number == 0)
                return "zero";

            if (number < 0)
                return "minus " + NumberToWords(Math.Abs(number));

            string words = "";

            if ((number / 1000000000) > 0)
            {
                words += NumberToWords(number / 1000000000) + " billion ";
                number %= 1000000000;
            }

            if ((number / 1000000) > 0)
            {
                words += NumberToWords(number / 1000000) + " million ";
                number %= 1000000;
            }

            if ((number / 1000) > 0)
            {
                words += NumberToWords(number / 1000) + " thousand ";
                number %= 1000;
            }

            if ((number / 100) > 0)
            {
                words += NumberToWords(number / 100) + " hundred ";
                number %= 100;
            }

            if (number > 0)
            {
                if (words != "")
                    words += "and ";

                var unitsMap = new[] { "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen" };
                var tensMap = new[] { "zero", "ten", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety" };

                if (number < 20)
                    words += unitsMap[number];
                else
                {
                    words += tensMap[number / 10];
                    if ((number % 10) > 0)
                        words += "-" + unitsMap[number % 10];
                }
            }

            return words.Trim();
        }

        public static string ToCurrencyInWords(this decimal amount)
        {
            var r = (int)amount;
            var c = (int)((amount - r) * 100);

            var result = r.NumberToWords() +
                (c > 0 ? String.Format(" and {0} cents", c.NumberToWords()) : "");

            return result;
        }

        /// <summary>
        /// Creates an MD5 fingerprint of the string.
        /// </summary>
        public static string ToMd5Fingerprint(this string s)
        {
            var bytes = Encoding.Unicode.GetBytes(s.ToCharArray());
            var hash = MD5.Create().ComputeHash(bytes);

            // concat the hash bytes into one long string
            return hash.Aggregate(new StringBuilder(32),
                (sb, b) => sb.Append(b.ToString("X2")))
                .ToString();
        }

        public static bool IsNumeric(this string val)
        {
            Double result;
            return Double.TryParse(val, NumberStyles.Any, CultureInfo.CurrentCulture, out result);
        }

        public static string ToHtmlParagraphs(this string text)
        {
            return text == null
                ? null
                : text
                    .Replace("\n\r", "\n").Replace("\r\n", "\n")
                    .Split('\n')
                    .Select(p => String.Format("<p>{0}</p>", p))
                    .Delimited("");
        }

        public static string ToHtmlWithBreaks(this string text)
        {
            return text == null
                ? null
                : text
                    .Replace("\n\r", "\n").Replace("\r\n", "\n")
                    .Split('\n')
                    .Delimited("<br/>");
        }

        public static string RemovePrefix(this string val, string prefix, bool ignoreCase = true)
        {
            return val.StartsWith(prefix, ignoreCase, CultureInfo.InvariantCulture)
                ? val.Substring(prefix.Length)
                : val;
        }

        public static string RemovePostfix(this string val, string postfix, bool ignoreCase = true)
        {
            return val.EndsWith(postfix, ignoreCase, CultureInfo.InvariantCulture)
                ? val.Substring(0, val.Length - postfix.Length)
                : val;
        }

        public static List<int> ParseToIntList(this string value)
        {
            return (value ?? "").Split(',')
                .Select(v => v.Trim())
                .Where(v => !String.IsNullOrWhiteSpace(v))
                .Select(v => Convert.ToInt32(v))
                .ToList();
        }

        public static bool EqualsOrEmpty(this string s1, string s2, StringComparison comparisonType = StringComparison.InvariantCultureIgnoreCase)
        {
            return String.IsNullOrEmpty(s1) && String.IsNullOrEmpty(s2) ||
                s1 != null && s2 != null && s1.Equals(s2, comparisonType);
        }

        public static string RemoveDoubleSpaces(this string source)
        {
            return Regex.Replace(source, @"\s+", " ");
        }


        /// <summary>
        /// Convert a comma separated string to a list.
        /// </summary>
        /// <param name="value">comma separated string to be converted to list</param>
        /// <returns></returns>
        public static List<string> ConvertCommaSeparatedStringToList(string value)
        {
            if (!String.IsNullOrEmpty(value))
            {
                return
                    value.Split(',')
                            .Select(t => t)
                            .ToList();
            }
            else
            {
                return null;
            }

        }

        public static string FormatMobileNo(this string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return value;

            var result = Regex.Replace(value, @"[^0-9]+", string.Empty);
            if (result.Length == 10)
            {
                return $"({result.Substring(0, 3)})-{result.Substring(3, 3)}-{result.Substring(6, 4)}";
            }
            else
                return value;
        }

        public static string RemovePathIllegalCharacters(this string fileName, string whatToReplaceWith = "")
        {
            string invalid = new string(Path.GetInvalidFileNameChars()) + new string(Path.GetInvalidPathChars());

            foreach (char c in invalid)
            {
                fileName = fileName.Replace(c.ToString(), whatToReplaceWith);
            }
            return fileName;
        }

        /// <summary>
        /// Converts string to camel case (taken from the Newtonsoft.Json.Utilities.StringUtils)
        /// </summary>
        public static string ToCamelCase(this string s)
        {
            if (string.IsNullOrEmpty(s) || !char.IsUpper(s[0]))
            {
                return s;
            }

            char[] chars = s.ToCharArray();

            for (int i = 0; i < chars.Length; i++)
            {
                if (i == 1 && !char.IsUpper(chars[i]))
                {
                    break;
                }

                bool hasNext = (i + 1 < chars.Length);
                if (i > 0 && hasNext && !char.IsUpper(chars[i + 1]))
                {
                    break;
                }

                char c;
#if HAVE_CHAR_TO_STRING_WITH_CULTURE
                c = char.ToLower(chars[i], CultureInfo.InvariantCulture);
#else
                c = char.ToLowerInvariant(chars[i]);
#endif
                chars[i] = c;
            }

            return new string(chars);
        }

        /// <summary>
        /// Converts string to array of bytes
        /// </summary>
        /// <param name="str">string to convert</param>
        /// <returns>array of bytes</returns>
        public static byte[] ToBytesArray(this string str)
        {
            byte[] bytes = new byte[str.Length * sizeof(char)];
            Buffer.BlockCopy(str.ToCharArray(), 0, bytes, 0, bytes.Length);
            return bytes;
        }

        /// <summary>
        /// Converts array of bytes to string
        /// </summary>
        /// <param name="bytes">array of bytes to convert</param>
        /// <returns>string</returns>
        public static string GetString(this byte[] bytes)
        {
            char[] chars = new char[bytes.Length / sizeof(char)];
            Buffer.BlockCopy(bytes, 0, chars, 0, bytes.Length);
            return new string(chars);
        }

        /// <summary>
        /// Convert string to int
        /// </summary>
        public static int ToInt(this string source, int defaultValue)
        {
            if (string.IsNullOrEmpty(source) ||
                !Int32.TryParse(source, out var result))
                return defaultValue;
            return result;
        }

        /// <summary>
        /// Convert string to int
        /// </summary>
        public static int? ToIntOrNull(this string source, int? defaultValue = null)
        {
            if (string.IsNullOrEmpty(source) || !Int32.TryParse(source, out var result))
                return defaultValue;
            return result;
        }
        public static string ToRoman(this int number)
        {
            var romanNumerals = new[]
            {
                new []{"", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"}, // ones
                new []{"", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"}, // tens
                new []{"", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"}, // hundreds
                new []{"", "M", "MM", "MMM"} // thousands
            };

            // split integer string into array and reverse array
            var intArr = number.ToString().Reverse().ToArray();
            var len = intArr.Length;
            var romanNumeral = "";
            var i = len;

            // starting with the highest place (for 3046, it would be the thousands
            // place, or 3), get the roman numeral representation for that place
            // and add it to the final roman numeral string
            while (i-- > 0)
                romanNumeral += romanNumerals[i][int.Parse(intArr[i].ToString())];

            return romanNumeral;
        }

        /// <summary>
        /// Convert string to long
        /// </summary>
        public static long ToLong(this string source, long defaultValue)
        {
            if (string.IsNullOrEmpty(source) ||
                !long.TryParse(source, out var result))
                return defaultValue;
            return result;
        }

        /// <summary>
        /// Convert string to decimal
        /// </summary>
        public static decimal ToDecimal(this string source, decimal defaultValue)
        {
            if (String.IsNullOrEmpty(source) ||
                !Decimal.TryParse(source, out var result))
                return defaultValue;
            return result;
        }

        /// <summary>
        /// Returns a string formatted into a proper telephone number.
        /// </summary>
        public static string FormatAsTelephoneNumber(this string telNumber)
        {
            if (telNumber == null)
                return null;

            var cleanNo = telNumber.Trim().Replace(" ", "").Replace("-", "").Replace("(", "").Replace(")", "");

            if (cleanNo.Length == 4)
            {
                return "X" + cleanNo;   // Appending Extension number indicator
            }
            else if (cleanNo.Length == 10 || cleanNo.Length == 11)
            {
                return cleanNo.Substring(0, 3) + " " + cleanNo.Substring(3, 3) + " " + cleanNo.Substring(6);
            }
            else
            {
                return cleanNo;
            }
        }

        /// <summary>
        /// Keeps only numeric characters in the string
        /// </summary>
        public static string RemoveAllNonNumericCharacters(this string initialString)
        {
            if (initialString == null)
                return "";
            var nonNumericCharacters = new System.Text.RegularExpressions.Regex(@"\D");
            return nonNumericCharacters.Replace(initialString, String.Empty);
        }

        /// <summary>
        /// Keeps only alphanumeric characters in the string
        /// </summary>
        public static string RemoveAllNonAlphaNumericCharacters(this string initialString)
        {
            if (initialString == null)
                return "";
            var nonAlphaNumericCharacters = new System.Text.RegularExpressions.Regex(@"[^a-zA-Z\d]");
            return nonAlphaNumericCharacters.Replace(initialString, String.Empty);
        }

        public static string ToCurrencyString(this decimal currency, bool showEmptyIfZero = false)
        {
            return showEmptyIfZero && currency == 0 ? "" : String.Format("{0:R#,##0.00}", currency);
        }

        public static string ToCurrencyString(this decimal? currency, bool showEmptyIfZero = false)
        {
            return currency.HasValue ? currency.Value.ToCurrencyString(showEmptyIfZero) : "";
        }

        public static IEnumerable<string> Split(this string str, int chunkSize)
        {
            var result = new List<string>();

            var pos = 0;
            while (pos < str.Length)
            {
                var length = Math.Min(str.Length - pos, chunkSize);
                result.Add(str.Substring(pos, length));
                pos += length;
            }

            return result;
        }

        public static int CharCount(this string source, char ch)
        {
            int count = 0;
            if (!string.IsNullOrWhiteSpace(source))
            {
                foreach (char c in source)
                    if (c == '/') count++;
            }

            return count;
        }

        public static string MaskMobileNo(this string mobileNo)
        {
            if (string.IsNullOrWhiteSpace(mobileNo))
                return mobileNo;

            var formattedMobile = mobileNo.FormatMobileNo();

            var regex = new Regex(@"\d");
            formattedMobile = regex.Replace(formattedMobile.Left(formattedMobile.Length - 4), "*") + formattedMobile.Right(4);

            return formattedMobile;
        }


        public static string MaskEmail(this string email, int usernameChars = 5, int domainChars = 7)
        {
            if (string.IsNullOrWhiteSpace(email))
                return email;

            var username = email.LeftPart('@', ProcessDirection.LeftToRight) ?? "";
            if (username.Length > usernameChars)
                username = username.Left(5) + "".PadRight(username.Length - usernameChars, '*');

            var domain = email.RightPart('@', ProcessDirection.RightToLeft);
            if (domain.Length > domainChars)
                domain = "".PadRight(domain.Length - domainChars, '*') + domain.Right(domainChars);

            return username + "@" + domain;
        }

        /// <summary>
        /// ACKNOWLEDGEMENT: Taken from http://weblogs.asp.net/jgalloway/archive/2005/09/27/426087.aspx
        /// Parses a camel cased or pascal cased string and returns an array
        /// of the words within the string.
        /// NOTE: There are more compact ways of achieving this using RegEx but results from link above 
        /// show this to be about 15 times quicker. 
        /// </summary>
        /// <example>
        /// The string "PascalCasing" will return an array with two
        /// elements, "Pascal" and "Casing".
        /// </example>
        /// <param name="source"></param>
        /// <returns></returns>
        public static string[] SplitUpperCase(this string source)
        {
            if (source == null)
                return new string[] { }; //Return empty array.

            if (source.Length == 0)
                return new string[] { "" };

            var words = new StringCollection();
            int wordStartIndex = 0;

            char[] letters = source.ToCharArray();
            // Skip the first letter. we don't care what case it is.
            for (int i = 1; i < letters.Length; i++)
            {
                if (Char.IsUpper(letters[i]))
                {
                    //Grab everything before the current index.
                    words.Add(new String(letters, wordStartIndex, i - wordStartIndex));
                    wordStartIndex = i;
                }
            }

            //We need to have the last word.
            words.Add(new String(letters, wordStartIndex, letters.Length - wordStartIndex));

            //Copy to a string array.
            string[] wordArray = new string[words.Count];
            words.CopyTo(wordArray, 0);
            return wordArray;
        }

        /// <summary>
        /// ACKNOWLEDGEMENT: Taken from http://weblogs.asp.net/jgalloway/archive/2005/09/27/426087.aspx
        /// Parses a camel cased or pascal cased string and returns a new
        /// string with spaces between the words in the string.
        /// </summary>
        /// <example>
        /// The string "PascalCasing" will return an array with two
        /// elements, "Pascal" and "Casing".
        /// </example>
        /// <param name="source"></param>
        /// <returns></returns>
        public static string SplitUpperCaseToString(this string source)
        {
            return String.Join(" ", SplitUpperCase(source));
        }

        public static bool IsValidEmail(this string inputEmail)
        {
            string strRegex = @"^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}" +
                              @"\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\" +
                              @".)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$";
            Regex re = new Regex(strRegex);
            if (re.IsMatch(inputEmail))
                return (true);
            else
                return (false);
        }

        [DebuggerStepThrough]
        public static string StripHtml(this string target)
        {
            if (string.IsNullOrEmpty(target))
                return "";

            // The text inside tags may contain some stuff that produces undesired trailing or starting line breaks when showing as plain text. Trim characters that cause this.
            var result = StringHelper.HtmlTrim(target, ' ', '\n', '\r', '\t');

            result = StripHTMLStyleExpression
                .Replace(target, String.Empty);
            result = StripHTMLExpression
                .Replace(result, String.Empty)
                .Replace("&nbsp;", " ")
                .Replace("&nbsp;", " ")
                .Replace("&gt;", ">")
                .Replace("&lt;", "<");

            return result;
        }

        private static string HtmlTrim(string html, params char[] trimChars)
        {
            if (!html?.Trim().StartsWith("<") ?? true)
                html = "<p>" + html + "</p>";
            var document = new HtmlDocument();
            document.LoadHtml(html ?? "");
            var lastParagraph = document.DocumentNode?.SelectNodes("//text()[normalize-space(.) != '']")?.LastOrDefault();
            if (lastParagraph != null)
            {
                lastParagraph.InnerHtml = lastParagraph.InnerHtml.Trim(trimChars);
            }
            using (var writer = new StringWriter())
            {
                document.Save(writer);
                return writer.ToString();
            }
        }

        /// <summary>
        /// Removes all non-ASCII characters from the string
        /// Courtesy: http://stackoverflow.com/a/135473/476786
        /// Uses the .NET ASCII encoding to convert a string. 
        /// UTF8 is used during the conversion because it can represent any of the original characters. 
        /// It uses an EncoderReplacementFallback to to convert any non-ASCII character to an empty string.
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public static string RemoveNonASCII(this string value)
        {
            string cleanStr =
                Encoding.ASCII
                    .GetString(
                        Encoding.Convert(Encoding.UTF8,
                            Encoding.GetEncoding(Encoding.ASCII.EncodingName,
                                new EncoderReplacementFallback(string.Empty),
                                new DecoderExceptionFallback()
                            ),
                            Encoding.UTF8.GetBytes(value)
                        )
                    );
            return cleanStr;
        }

        /// <summary>
        /// Adds double quotes to the specified <paramref name="value"/>
        /// </summary>
        public static string DoubleQuote(this string value) 
        {
            return !string.IsNullOrWhiteSpace(value)
                ? "\"" + value + "\""
                : value;
        }
    }
}
