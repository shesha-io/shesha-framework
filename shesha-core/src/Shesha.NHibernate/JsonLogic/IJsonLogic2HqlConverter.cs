using Newtonsoft.Json.Linq;

namespace Shesha.JsonLogic
{
    /// <summary>
    /// Json Logic to HQL converter
    /// </summary>
    public interface IJsonLogic2HqlConverter
    {
        /// <summary>
        /// Convert Json Logic to HQL
        /// </summary>
        /// <param name="rule"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        string Convert(JToken rule, JsonLogic2HqlConverterContext context);

        /// <summary>
        /// Get props of the Json Logic operation
        /// </summary>
        /// <param name="rule"></param>
        /// <returns></returns>
        OperationProps GetOperation(JToken rule);

        /// <summary>
        /// Resolve variable
        /// </summary>
        /// <param name="value"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        string ResolveVariable(string value, JsonLogic2HqlConverterContext context);
    }
}
