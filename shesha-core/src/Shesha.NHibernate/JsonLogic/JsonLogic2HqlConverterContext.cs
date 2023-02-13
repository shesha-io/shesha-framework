using System.Collections.Generic;
using Shesha.Metadata;

namespace Shesha.JsonLogic
{
    /// <summary>
    /// Json Logic to HQL converter context
    /// </summary>
    public class JsonLogic2HqlConverterContext
    {
        /// <summary>
        /// Query parameters prefix
        /// </summary>
        public string ParametersPrefix { get; set; } = "par";

        /// <summary>
        /// List of query parameters
        /// </summary>
        public Dictionary<string, object> FilterParameters { get; set; } = new Dictionary<string, object>();

        /// <summary>
        /// Variable resolvers
        /// </summary>
        public Dictionary<string, string> VariablesResolvers { get; set; } = new Dictionary<string, string>();

        /// <summary>
        /// Fields metadata dictionary
        /// </summary>
        public Dictionary<string, IPropertyMetadata> FieldsMetadata { get; set; } = new Dictionary<string, IPropertyMetadata>();

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="parametersPrefix"></param>
        public JsonLogic2HqlConverterContext(string parametersPrefix)
        {
            ParametersPrefix = parametersPrefix;
        }

        /// <summary>
        /// Default constructor
        /// </summary>
        public JsonLogic2HqlConverterContext()
        {
            
        }

        /// <summary>
        /// Add new parameter and get it's name
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public string AddParameter(object value)
        {
            var name = $"{ParametersPrefix}{FilterParameters.Count + 1}";
            FilterParameters.Add(name, value);
            
            return name;
        }
    }
}
