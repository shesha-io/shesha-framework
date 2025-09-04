using Abp.Extensions;
using Shesha.Extensions;
using Shesha.Metadata;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Settings
{
    /// <summary>
    /// Setting provider extensions
    /// </summary>
    public static class Extensions
    {
        /// <summary>
        /// Gets value of a setting in given type (<typeparamref name="T"/>).
        /// </summary>
        /// <typeparam name="T">Type of the setting to get</typeparam>
        /// <param name="settingProvider">Setting manager</param>
        /// <param name="module">Setting module</param>
        /// <param name="name">Unique name of the setting</param>
        /// <returns>Value of the setting</returns>
        public static async Task<T> GetSettingValueAsync<T>(this IShaSettingManager settingProvider, string module, string name)
            where T : struct
        {
            return (await settingProvider.GetOrNullAsync(module, name)).To<T>();
        }

        public static DataTypeInfo GetSettingDataType(this SettingDefinition definition) 
        {
            var valueType = definition.GetValueType();
            var propType = ReflectionHelper.GetUnderlyingTypeIfNullable(valueType);

            if (propType == typeof(Guid))
                return new DataTypeInfo(DataTypes.Guid);

            // for enums - use underlaying type
            if (propType.IsEnum)
                propType = propType.GetEnumUnderlyingType();

            if (propType == typeof(string))
            {
                return new DataTypeInfo(DataTypes.String);
            }

            if (propType == typeof(DateTime))
            {
                return new DataTypeInfo(DataTypes.DateTime);
            }

            if (propType == typeof(TimeSpan))
                return new DataTypeInfo(DataTypes.Time);

            if (propType == typeof(bool))
                return new DataTypeInfo(DataTypes.Boolean);

            //if (propInfo.IsReferenceListProperty())
            //    return new DataTypeInfo(DataTypes.ReferenceListItem);

            if (propType.IsEntityType() || propType.IsEntityReferenceType())
                return new DataTypeInfo(DataTypes.EntityReference);

            // note: numeric datatypes mapping is based on the OpenApi 3
            if (propType == typeof(int) || propType == typeof(byte) || propType == typeof(short))
                return new DataTypeInfo(DataTypes.Number, NumberFormats.Int32);

            if (propType == typeof(Int64))
                return new DataTypeInfo(DataTypes.Number, NumberFormats.Int64);

            if (propType == typeof(Single) || propType == typeof(float))
                return new DataTypeInfo(DataTypes.Number, NumberFormats.Float);

            if (propType == typeof(double) || propType == typeof(decimal))
                return new DataTypeInfo(DataTypes.Number, NumberFormats.Double);

            if (propType.IsSubtypeOfGeneric(typeof(IList<>)) || propType.IsSubtypeOfGeneric(typeof(ICollection<>)) ||
                propType.IsSubtypeOfGeneric(typeof(List<>)) || propType.IsSubtypeOfGeneric(typeof(Collection<>)) ||
                propType.IsSubtypeOfGeneric(typeof(IEnumerable<>))
                )
            {
                var genericArgs = propType.GetGenericArguments();
                var paramType = genericArgs.Any()
                    ? propType.GetGenericArguments()[0]
                    : propType.GetElementType();

                var format = paramType.NotNull().IsClass
                    ? paramType.IsEntityType()
                        ? ArrayFormats.EntityReference
                        : ArrayFormats.ChildObjects
                    : null;
                return new DataTypeInfo(DataTypes.Array, format, format != null ? paramType.FullName : null);
            }

            if (propType.IsClass)
            {
                if (propType.IsJsonEntityType())
                    return new DataTypeInfo(DataTypes.Object, ObjectFormats.Interface);
                else
                    return new DataTypeInfo(DataTypes.Object, ObjectFormats.Object);
            }

            throw new NotSupportedException($"Data type not supported: {propType.FullName}");
        }
    }
}
