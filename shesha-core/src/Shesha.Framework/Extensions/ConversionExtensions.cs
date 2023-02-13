using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Extensions
{
    /// <summary>
    /// Type conversion
    /// </summary>
    public static class ConversionExtensions
    {
        /// <summary>
        /// Convert string to long
        /// </summary>
        public static long ToInt64(this string source, long defaultValue = 0)
        {
            if (string.IsNullOrEmpty(source) ||
                !long.TryParse(source, out var result))
                return defaultValue;
            return result;
        }

        /// <summary>
        /// Convert string to long
        /// </summary>
        public static long? ToInt64OrNull(this string source)
        {
            if (string.IsNullOrEmpty(source) || !long.TryParse(source, out var result))
                return null;
            return result;
        }

        public static Guid ToGuid(this int value)
        {
            byte[] bytes = new byte[16];
            BitConverter.GetBytes(value).CopyTo(bytes, 0);
            return new Guid(bytes);
        }
    }
}
