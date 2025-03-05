using Shesha.Reflection;
using System;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;

namespace Shesha.Utilities
{
    /// <summary>
    /// Utility class to help with the parsing of strings into various types of values used within Shesha applications.
    /// All string parsing into value should be occur within this class for consistency in parsing logic througout.
    /// </summary>
    public class Parser
    {
        #region TryParseToValueType
        /// <summary>
        /// Tries to convert from a string value to the specified Property's type.
        /// </summary>
        /// <param name="value">Value as a string to convert.</param>
        /// <param name="targetType"></param>
        /// <param name="parsedValue">The converted value if successful.</param>
        /// <param name="format">A format string, describing the format of the <paramref name="value"/> parameter</param>
        /// <param name="isDateOnly"></param>
        /// <param name="returnNullEvenIfNonNullable"></param>
        /// <returns>Returns true if the value could be converted successfully to the target property's type.</returns>
        public static bool TryParseToValueType(string? value, Type targetType, out object? parsedValue, string? format = null, bool isDateOnly = false, bool returnNullEvenIfNonNullable = false)
        {
            try
            {
                if (string.IsNullOrEmpty(value))
                {
                    if (targetType == typeof(string))
                    {
                        parsedValue = value;
                        return true;
                    }
                    else if (ReflectionHelper.IsNullableType(targetType) || returnNullEvenIfNonNullable)
                    {
                        parsedValue = null;
                        return true;
                    }
                    else
                    {
                        throw new ArgumentException(string.Format("Trying to parse '{0}' into target type but target type is not nullable.", value, targetType.Name));
                    }
                }
                else
                {
                    if (targetType.IsValueType
                        || targetType.Equals(typeof(string)))
                    {

                        if (targetType.Equals(typeof(DateTime))
                            || targetType.Equals(typeof(DateTime?)))
                        {
                            parsedValue = ParseDate(value, format, isDateOnly);
                        }
                        else if (targetType.Equals(typeof(TimeSpan))
                            || targetType.Equals(typeof(TimeSpan?)))
                        {
                            parsedValue = ParseTime(value, format);
                        }
                        else if (targetType.Equals(typeof(bool))
                            || targetType.Equals(typeof(bool?)))
                        {
                            parsedValue = ParseBoolean(value);
                        }
                        else if (targetType.Equals(typeof(double))
                            || targetType.Equals(typeof(double?)))
                        {
                            parsedValue = double.Parse(value, CultureInfo.InvariantCulture);
                        }
                        else if (targetType.Equals(typeof(Guid))
                            || targetType.Equals(typeof(Guid?)))
                        {
                            parsedValue = Guid.Parse(value);
                        }
                        else
                        {
                            var nonNullableTargetType = targetType.GetUnderlyingTypeIfNullable();

                            if (nonNullableTargetType.IsEnum)
                            {
                                parsedValue = Enum.Parse(nonNullableTargetType, value);
                            }
                            else
                            {
                                // Setting the property value.
                                object val = Convert.ChangeType(value, nonNullableTargetType);
                                parsedValue = val;
                            }
                        }

                        return true;
                    }
                    else
                    {
                        throw new InvalidOperationException(string.Format("Target type '{0}' is not a value type.", targetType.Name));
                    }
                }
            }
            catch (Exception)
            {
                //Logger<>.WriteLog(LogLevel.DEBUG, "Value parsing error", ex);
                parsedValue = null;
                return false;
            }
        }

        private static object ParseBoolean(string value)
        {
            bool parsedValue;

            value = value.ToUpper();
            if (value == "YES" || value == "Y" || value == "TRUE" || value == "1" || value == "ON" || value == "T")
                parsedValue = true;
            else if (value == "NO" || value == "N" || value == "FALSE" || value == "0" || value == "OFF" || value == "F")
                parsedValue = false;
            else
                throw new ArgumentException($"Value '{value}' cannot be parsed as a boolean.");

            return parsedValue;
        }

        public static TimeSpan? ParseTime(string? value, string? format = null)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            if (int.TryParse(value, out var seconds) && seconds < TimeSpan.FromHours(24).TotalSeconds) 
                return TimeSpan.FromSeconds(seconds);

            var timeFormats = new string?[] {
                format,
                /*note: `hh` is always 24-hours for TimeSpan*/
                @"hh\:mm\:ss", 
                @"hh\:mm"
            };
            foreach (var timeFormat in timeFormats) 
            {
                if (!string.IsNullOrWhiteSpace(timeFormat) && TimeSpan.TryParseExact(value, timeFormat, CultureInfo.InvariantCulture, TimeSpanStyles.None, out var timeSpan))
                    return timeSpan;
            }
            return null;
        }

        public static DateTime ParseDate(string value, string? format = null, bool isDateOnly = true)
        {
            var dateVal = new DateTime();
            bool parseSuccessful = false;

            if (!string.IsNullOrWhiteSpace(format))
            {
                // Trying to parse using the specified pattern first.
                parseSuccessful = DateTime.TryParseExact(value, format, CultureInfo.InvariantCulture, DateTimeStyles.None, out dateVal);
                if (!parseSuccessful)
                    throw new FormatException($"Datetime format is incorrect");
            }
            else if (string.IsNullOrEmpty(format))
            {
                parseSuccessful = DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.None, out dateVal);
                if (!parseSuccessful)
                {
                    // If no format specified will default to standard named formats.
                    if (isDateOnly)
                    {
                        parseSuccessful = DateTime.TryParseExact(value, "yyyy-MM-dd", //UISettings.DefaultDateFormat(isForEdit: true),
                                               CultureInfo.InvariantCulture, DateTimeStyles.None, out dateVal);
                        if (!parseSuccessful)
                            throw new FormatException($"Date format is incorrect");
                    }
                    else
                    {
                        parseSuccessful = DateTime.TryParseExact(value, "yyyy-MM-ddTHH-mm-ssZ", //UISettings.DefaultDateTimeFormat(isForEdit: true),
                            CultureInfo.InvariantCulture, DateTimeStyles.None, out dateVal);
                        // try to parse only date if time is not posted to the server
                        if (!parseSuccessful)
                            parseSuccessful = DateTime.TryParseExact(value, "yyyy-MM-dd", //UISettings.DefaultDateFormat(isForEdit: true),
                                CultureInfo.InvariantCulture, DateTimeStyles.None, out dateVal);

                        if (!parseSuccessful)
                            throw new FormatException($"Datetime format is incorrect");
                    }
                }
            }

            if (isDateOnly)
            {
                dateVal = dateVal.Date;
            }

            return dateVal;
        }

        #endregion

        public static bool CanParseTo([NotNullWhen(true)] string? value, Type type)
        {
            try
            {
                var parsed = ParseTo(value, type);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        /// <summary>
        /// Parses the Id of the entity of the specified type
        /// </summary>
        public static object? ParseId(string? value, Type entityType)
        {
            if (string.IsNullOrWhiteSpace(value) || value == "-999")
                return null;

            var idProp = entityType.GetProperty("Id");
            if (idProp == null)
                throw new Exception($"Id property not found in the class '{entityType.Name}'");

            var result = ParseTo(value, idProp.PropertyType);

            return typeof(Int64).IsAssignableFrom(idProp.PropertyType) && result != null && ((Int64)result <= 0)
                ? null
                : result;
        }

        public static bool CanParseId([NotNullWhen(true)]string? value, Type entityType)
        {
            if (string.IsNullOrWhiteSpace(value) || value == "-999")
                return false;

            var idProp = entityType.GetProperty("Id");
            if (idProp == null)
                return false;

            return CanParseTo(value, idProp.PropertyType);
        }

        public static object? ParseTo(string? value, Type type)
        {
            if (string.IsNullOrEmpty(value) || type == null)
                return null;
            System.ComponentModel.TypeConverter conv = System.ComponentModel.TypeDescriptor.GetConverter(type);
            if (conv.CanConvertFrom(typeof(string)))
            {
                return conv.ConvertFrom(value);
            }
            else
                throw new Exception($"Can't convert string to type {type.Name}");
        }
    }
}
