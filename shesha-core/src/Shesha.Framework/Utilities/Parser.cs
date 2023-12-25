using Abp.Domain.Entities;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Reflection;
using System;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Reflection;
using EntityExtensions = Shesha.Extensions.EntityExtensions;

namespace Shesha.Utilities
{
    /// <summary>
    /// Utility class to help with the parsing of strings into various types of values used within Shesha applications.
    /// All string parsing into value should be occur within this class for consistency in parsing logic througout.
    /// </summary>
    public class Parser
    {
        public static bool TryParseToMultiValueReferenceListValue(string value, out int? parsedValue, string referenceListModule, string referenceListName)
        {
            try
            {
                if (string.IsNullOrEmpty(value) || value == "-999" || value == "(null)")
                {
                    parsedValue = null;
                    return true;
                }
                else
                {
                    if (value.Contains(','))
                    {
                        // Values provided as comma separated list.
                        parsedValue = 0;
                        var valuesAr = value.Split(',');
                        foreach (var val in valuesAr)
                        {
                            if (!string.IsNullOrWhiteSpace(val))
                            {
                                parsedValue += int.Parse(val.Trim());
                            }
                        }
                    }
                    else
                    {
                        // Single value provided
                        int intValue;
                        if (!int.TryParse(value, out intValue))
                        {
                            parsedValue = null;
                            return false;
                        }

                        var intVal = int.Parse(value);
                        parsedValue = intVal;
                    }

                    // Checking that all the items are valid reference list values.
                    //var itemsAr = EntityExtensions.DecomposeIntoBitFlagComponents(parsedValue.Value);

                    /* Don't fail when item not from list was provided.
                    var refList = ReferenceListService.GetCachedList(referenceListNamespace, referenceListName);
                    for (int i = 0; i < itemsAr.Length; i++)
                    {
                        if (refList.Items.FirstOrDefault(item => item.ItemValue == itemsAr[i]) == null)
                        {
                            throw new ArgumentException(string.Format("'{0}' is not a valid value from Reference List '{1}'.", itemsAr[i], referenceListNamespace + "." + referenceListName));
                        }
                    }*/
                }
            }
            catch (Exception)
            {
                //Logger<>.WriteLog(LogLevel.DEBUG, "Value parsing error", ex);
                parsedValue = null;
                return false;
            }

            return true;
        }

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
        public static bool TryParseToValueType(string value, Type targetType, out object parsedValue, string format = null, bool isDateOnly = false, bool returnNullEvenIfNonNullable = false)
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
                            Type nonNullableTargetType;
                            if (ReflectionHelper.IsNullableType(targetType))
                                nonNullableTargetType = Nullable.GetUnderlyingType(targetType);
                            else
                                nonNullableTargetType = targetType;

                            if (nonNullableTargetType.IsEnum)
                            {
                                parsedValue = System.Enum.Parse(nonNullableTargetType, value);
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

        public static TimeSpan? ParseTime(string value, string format = null)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            if (int.TryParse(value, out var seconds) && seconds < TimeSpan.FromHours(24).TotalSeconds) 
                return TimeSpan.FromSeconds(seconds);

            var timeFormats = new string[] {
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

        public static DateTime ParseDate(string value, string format = null, bool isDateOnly = true)
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

        public static bool TryParseToEntity(string value, Type entityType, out IEntity parsedValue, out bool hasNewEntityIndicator)
        {
            throw new NotImplementedException();
            /*
            hasNewEntityIndicator = false;

            try
            {
                if (string.IsNullOrEmpty(value)
                    || string.Equals("(null)", value, StringComparison.InvariantCultureIgnoreCase)
                    || string.Equals("-999", value, StringComparison.InvariantCultureIgnoreCase))    // -999 is used by some controls to denote 'no/null selection'.
                {
                    parsedValue = null;
                    return true;
                }
                else if (value.Contains('|'))
                {
                    // Value is FullyQualifiedEntityId specifies the type of entity.
                    var referencedEntity = DynamicRepository.Get(value);

                    if (referencedEntity == null)
                        throw new ArgumentException($"Entity referenced by value '{value}' does not exist.");

                    parsedValue = referencedEntity;
                    return true;
                }
                else
                {
                    if (entityType == null)
                        throw new ArgumentException("If the value does not provide the entity type and Id, the entityType parameter must be supplied.");

                    // Getting the referenced entity.
                    var referencedEntityId = ParseId(value, entityType);

                    var isNull = referencedEntityId != null && referencedEntityId is Guid
                        ? (Guid)referencedEntityId == Guid.Empty
                        : referencedEntityId == null;

                    if (!isNull)
                    {
                        var referencedEntity = NHibernateSession.Current.Get(entityType, referencedEntityId) as IEntity;

                        if (referencedEntity == null)
                            throw new ArgumentException(
                                $"Entity of type '{entityType.FullName}' with Id '{referencedEntityId}' does not exist.");

                        parsedValue = referencedEntity;
                        return true;
                    }
                    else
                    {
                        // Reference is to a new entity which should not be set.
                        parsedValue = null;
                        hasNewEntityIndicator = true;
                        return true;
                    }

                }
            }
            catch (Exception ex)
            {
                Logger<>.WriteLog(LogLevel.DEBUG, "Value parsing error", ex);
                parsedValue = null;
                return false;
            }
            */
        }

        #region ParseToTargetPropertyType

        /// <summary>
        /// Parses a string value into the type the specified entity property would expect.
        /// </summary>
        /// <param name="value">String value to be parsed.</param>
        /// <param name="propInfo">PropertyInfo for the entity property into which the parsed value should be able to be set.</param>
        /// <param name="hasNewEntityIndicator">The returned value only has meaning in cases where the entity property is an entity references.
        /// If so this will be set to true if the parsed value indicates that the entity reference should be for a new entity.</param>
        /// <param name="format">A format string to help with the parsing.</param>
        /// <param name="returnNullEvenIfNonNullable"></param>
        /// <returns>Returns the parsed value in the appropriate type.</returns>
        public static object ParseToTargetPropertyType(string value, PropertyInfo propInfo, out bool hasNewEntityIndicator, string format = null, bool returnNullEvenIfNonNullable = false)
        {
            object parsedValue;
            var res = TryParseToTargetPropertyType(value, propInfo, out parsedValue, out hasNewEntityIndicator, format, returnNullEvenIfNonNullable);

            return parsedValue;
        }

        public static bool TryParseToTargetPropertyType(string value, PropertyInfo propInfo, out object parsedValue, out bool hasNewEntityIndicator, string format = null, bool returnNullEvenIfNonNullable = false)
        {
            hasNewEntityIndicator = false;

            if (string.IsNullOrEmpty(format))
            {
                var displayFormatAtt = propInfo.GetAttribute<DisplayFormatAttribute>();
                if (displayFormatAtt != null)
                {
                    if (displayFormatAtt.ApplyFormatInEditMode && !string.IsNullOrEmpty(displayFormatAtt.DataFormatString))
                        format = displayFormatAtt.DataFormatString;
                }
            }

            var generalDataType = EntityExtensions.GetGeneralDataType(propInfo);
            switch (generalDataType)
            {
                case GeneralDataType.Enum:
                    return TryParseToEnumPropertyType(value, propInfo, out parsedValue, returnNullEvenIfNonNullable);
                case GeneralDataType.ReferenceList:
                    return TryParseToReferenceListPropertyType(value, propInfo, out parsedValue, returnNullEvenIfNonNullable);
                case GeneralDataType.MultiValueReferenceList:
                    return TryParseToMultiValueReferenceListPropertyType(value, propInfo, out parsedValue);
                case GeneralDataType.EntityReference:
                    return TryParseToEntityReferencePropertyType(value, propInfo, out parsedValue, out hasNewEntityIndicator);
                default:
                    return TryParseToValueTypePropertyType(value, propInfo, out parsedValue, format, returnNullEvenIfNonNullable);
            }
        }

        internal static bool TryParseToEnumPropertyType(string value, PropertyInfo propInfo, out object parsedValue, bool returnNullEvenIfNonNullable = false)
        {
            parsedValue = null;
            string propertyName = propInfo.DeclaringType.Name + "." + propInfo.Name;

            var propConfig = propInfo.DeclaringType.GetEntityConfiguration()[propInfo.Name];

            if (string.IsNullOrEmpty(value))
                parsedValue = null;
            else
                parsedValue = ConvertRefListValueToPropertyType(propInfo, propertyName, (int)Enum.Parse(propConfig.EnumType, value));
            return true;
        }

        internal static bool TryParseToReferenceListPropertyType(string value, PropertyInfo propInfo, out object parsedValue, bool returnNullEvenIfNonNullable = false)
        {
            throw new NotImplementedException();
            /*
            parsedValue = null;
            string propertyName = propInfo.DeclaringType.Name + "." + propInfo.Name;

            var propConfig = EntityConfiguration.Get(propInfo.DeclaringType)[propInfo.Name];

            int? parsedValueInt;
            var res = Parser.TryParseToReferenceListValue(value, out parsedValueInt, propConfig.ReferenceListNamespace, propConfig.ReferenceListName, propInfo);
            if (!res)
                return false;

            if (parsedValueInt == null)
            {
                return (ReflectionHelper.IsNullableType(propInfo.PropertyType) || returnNullEvenIfNonNullable);
            }
            else
            {
                parsedValue = ConvertRefListValueToPropertyType(propInfo, propertyName, parsedValueInt);
                return true;
            }
            */
        }

        internal static bool TryParseToMultiValueReferenceListPropertyType(string value, PropertyInfo propInfo, out object parsedValue)
        {
            parsedValue = null;
            string propertyName = propInfo.DeclaringType.Name + "." + propInfo.Name;

            var propConfig = propInfo.DeclaringType.GetEntityConfiguration()[propInfo.Name];

            int? parsedValueInt;
            var res = Parser.TryParseToMultiValueReferenceListValue(value, out parsedValueInt, propConfig.ReferenceListModule, propConfig.ReferenceListName);

            if (!res)
                return false;

            if (parsedValueInt == null)
            {
                if (ReflectionHelper.IsNullableType(propInfo.PropertyType))
                    parsedValue = null;
                else
                    parsedValue = 0;
                return true;
            }
            else
            {
                parsedValue = ConvertRefListValueToPropertyType(propInfo, propertyName, parsedValueInt);
                return true;
            }
        }

        private static object ConvertRefListValueToPropertyType(PropertyInfo propInfo, string propertyName, int? parsedValue)
        {
            var nonNullablePropType = ReflectionHelper.GetUnderlyingTypeIfNullable(propInfo.PropertyType);

            if (nonNullablePropType.IsEnum)
            {
                return System.Enum.ToObject(nonNullablePropType, parsedValue.Value);
            }
            else if (nonNullablePropType == typeof(int)
                || nonNullablePropType == typeof(long)
                || nonNullablePropType == typeof(short))
            {
                return Convert.ChangeType(parsedValue.Value, nonNullablePropType);
            }
            else
            {
                throw new Exception(
                    $"ReferenceList property '{propertyName}' was of an unexpected type '{propInfo.PropertyType.FullName}'.");
            }
        }

        private static bool TryParseToValueTypePropertyType(string value, PropertyInfo propInfo, GeneralDataType generalDataType, out object parsedValue, string format = null, bool returnNullEvenIfNonNullable = false)
        {
            bool isDateOnly = generalDataType == GeneralDataType.Date;

            return Parser.TryParseToValueType(value, propInfo.PropertyType, out parsedValue, format, isDateOnly, returnNullEvenIfNonNullable);
        }

        internal static bool TryParseToValueTypePropertyType(string value, PropertyInfo propInfo, out object parsedValue, string format = null, bool returnNullEvenIfNonNullable = false)
        {
            var generalDataType = EntityExtensions.GetGeneralDataType(propInfo);
            return TryParseToValueTypePropertyType(value, propInfo, generalDataType, out parsedValue, format, returnNullEvenIfNonNullable);
        }

        private static bool TryParseToEntityReferencePropertyType(string value, PropertyInfo propInfo, out object parsedValue, out bool hasNewEntityIndicator)
        {
            parsedValue = null;
            string propertyName = propInfo.DeclaringType.Name + "." + propInfo.Name;

            var nonNullablePropType = ReflectionHelper.GetUnderlyingTypeIfNullable(propInfo.PropertyType);
            Type entityType;
            if (typeof(IEntity).IsAssignableFrom(nonNullablePropType))
            {
                entityType = nonNullablePropType;
            }
            else
            {
                throw new InvalidOperationException($"'{propertyName}' is not a valid Entity reference property type and not marked with the EntityReferenceAttribute.");
                /*
                var entityFerefenceAttribute = propInfo.GetAttribute<EntityReferenceAttribute>();
                if (entityFerefenceAttribute == null)
                    throw new InvalidOperationException($"'{propertyName}' is not a valid Entity reference property type and not marked with the EntityReferenceAttribute.");

                entityType = entityFerefenceAttribute.EntityType;
                */
            }

            IEntity parsedEntity;
            var res = Parser.TryParseToEntity(value, entityType, out parsedEntity, out hasNewEntityIndicator);
            if (!res)
                return false;

            if (parsedEntity == null)
            {
                if (hasNewEntityIndicator)
                {
                    parsedValue = null;
                    return true;
                }

                if (typeof(IEntity).IsAssignableFrom(nonNullablePropType) || ReflectionHelper.IsNullableType(propInfo.PropertyType))
                {
                    parsedValue = null;
                    return true;
                }
                else
                {
                    parsedValue = nonNullablePropType.GetTypeDefaultValue();
                    return true;
                }
            }
            else
            {
                if (typeof(IEntity).IsAssignableFrom(nonNullablePropType))
                {
                    parsedValue = parsedEntity;
                    return true;
                }
                else
                {
                    parsedValue = parsedEntity.GetId();
                    return true;
                }
            }
        }

        #endregion

        public static T ParseTo<T>(string value)
        {
            return (T)ParseTo(value, typeof(T));
        }

        public static bool CanParseTo<T>(string value)
        {
            return CanParseTo(value, typeof(T));
        }

        public static bool CanParseTo(string value, Type type)
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
        public static object ParseId(string value, Type entityType)
        {
            if (string.IsNullOrWhiteSpace(value) || value == "-999")
                return null;

            var idProp = entityType.GetProperty("Id");
            if (idProp == null)
                throw new Exception($"Id property not found in the class '{entityType.Name}'");

            var result = ParseTo(value, idProp.PropertyType);

            return typeof(Int64).IsAssignableFrom(idProp.PropertyType) && ((Int64)result <= 0)
                ? null
                : result;
        }

        public static bool CanParseId(string value, Type entityType)
        {
            if (string.IsNullOrWhiteSpace(value) || value == "-999")
                return false;

            var idProp = entityType.GetProperty("Id");
            if (idProp == null)
                return false;

            return CanParseTo(value, idProp.PropertyType);
        }

        public static object ParseTo(string value, Type type)
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
