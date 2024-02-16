using Abp.Extensions;

namespace Shesha.Extensions
{
    public static class ValueExtensions
    {
        public static T GetDefaultIfEmpty<T>(this T value, T defaultValue)
        {
            return string.IsNullOrEmpty(value?.ToString()) ? defaultValue : value;
        }
    }
}
