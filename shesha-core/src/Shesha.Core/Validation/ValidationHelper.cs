using System.Text.RegularExpressions;

namespace Shesha.Validation
{
    public static class ValidationHelper
    {
        public const string EmailRegex = @"^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$";

        public static bool IsEmail(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return false;

            var regex = new Regex(EmailRegex);
            return regex.IsMatch(value);
        }
    }
}
