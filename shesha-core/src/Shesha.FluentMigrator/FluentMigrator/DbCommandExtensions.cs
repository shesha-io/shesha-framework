using System.Data;

namespace Shesha.FluentMigrator
{

    /// <summary>
    /// DB Command extensions
    /// </summary>
    public static class DbCommandExtensions
    {
        public static void AddParameter<TValue>(this IDbCommand command, string name, TValue? value)
        {
            var parameter = command.CreateParameter();
            parameter.ParameterName = name;
            parameter.Value = value != null
                ? value
                : DBNull.Value;
            if (value == null)
                parameter.DbType = typeof(TValue).ToDbType();
            command.Parameters.Add(parameter);
        }

        private static readonly Dictionary<Type, DbType> TypeMap = new Dictionary<Type, DbType>
        {
            { typeof(byte), DbType.Byte },
            { typeof(sbyte), DbType.SByte },
            { typeof(short), DbType.Int16 },
            { typeof(ushort), DbType.UInt16 },
            { typeof(int), DbType.Int32 },
            { typeof(uint), DbType.UInt32 },
            { typeof(long), DbType.Int64 },
            { typeof(ulong), DbType.UInt64 },
            { typeof(float), DbType.Single },
            { typeof(double), DbType.Double },
            { typeof(decimal), DbType.Decimal },
            { typeof(bool), DbType.Boolean },
            { typeof(string), DbType.String },
            { typeof(char), DbType.StringFixedLength },
            { typeof(Guid), DbType.Guid },
            { typeof(DateTime), DbType.DateTime },
            { typeof(DateTimeOffset), DbType.DateTimeOffset },
            { typeof(TimeSpan), DbType.Time },
            { typeof(byte[]), DbType.Binary },            
        };

        /// <summary>
        /// Converts a .NET Type to System.Data.DbType
        /// </summary>
        /// <param name="type">The .NET type to convert</param>
        /// <returns>The corresponding DbType, or DbType.Object if no mapping found</returns>
        private static DbType ToDbType(this Type type)
        {
            if (type == null)
                throw new ArgumentNullException(nameof(type));

            // Handle nullable types by getting the underlying type
            Type underlyingType = Nullable.GetUnderlyingType(type) ?? type;

            if (TypeMap.TryGetValue(underlyingType, out DbType dbType))
            {
                return dbType;
            }

            // Handle enums as their underlying type
            if (underlyingType.IsEnum)
            {
                return ToDbType(Enum.GetUnderlyingType(underlyingType));
            }

            // Return Object for unmapped types
            return DbType.Object;
        }
    }
}
