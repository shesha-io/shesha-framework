using GraphQL.Conversion;
using GraphQL.Types;
using Shesha.Utilities;

namespace Shesha.GraphQL.Provider
{
    /// <summary>
    /// Alternative camel case converter. Is used because of wrong conversion logic in the standard <see cref="GraphQL.Conversion.CamelCaseNameConverter"/>. Example of bug in the standard converter: "IMEI" => "iMEI" (correct result is "imei")
    /// Camel case name converter; set as the default <see cref="INameConverter"/> within <see cref="Schema.NameConverter"/>.
    /// Always used by all introspection fields regardless of the selected <see cref="INameConverter"/>.
    /// </summary>
    public class ShaCamelCaseNameConverter : INameConverter
    {
        /// <summary>
        /// Static instance of <see cref="CamelCaseNameConverter"/> that can be reused instead of creating new.
        /// </summary>
        public static readonly ShaCamelCaseNameConverter Instance = new();

        /// <summary>
        /// Returns the field name converted to camelCase.
        /// </summary>
        public string NameForField(string fieldName, IComplexGraphType parentGraphType) => StringHelper.ToCamelCase(fieldName);
        
        /// <summary>
        /// Returns the argument name converted to camelCase.
        /// </summary>
        public string NameForArgument(string argumentName, IComplexGraphType parentGraphType, FieldType field) => StringHelper.ToCamelCase(argumentName);
    }
}
