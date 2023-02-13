using System.Linq;
using Abp.Dependency;
using JsonLogic.Net;
using Newtonsoft.Json.Linq;
using Shesha.Utilities;

namespace Shesha.JsonLogic
{
    /// <summary>
    /// HQL Json Logic evaluator. Converts JsonLogic expression to hql
    /// </summary>
    public class JsonLogic2HqlConverter: IJsonLogic2HqlConverter, ITransientDependency
    {
        private HqlOperators operations;

        public JsonLogic2HqlConverter()
        {
            this.operations = HqlOperators.Default;
        }

        public string Convert(JToken rule, JsonLogic2HqlConverterContext context)
        {
            if (rule is JValue value) return
                AdjustType(value.Value, context);
            if (rule is JArray array) 
                return array.Select(r => Convert(r, context)).ToArray().Delimited(","); // todo: check and replace with a delimiter constant + add parameters support if needed

            if (rule is JObject ruleObj)
            {
                var operationProps = GetOperation(ruleObj);
                var jsOperator = operations.GetOperator(operationProps.Operation);
                return jsOperator(this, operationProps.Arguments, context);
            }

            return null;
        }

        /// <summary>
        /// Get operation props
        /// </summary>
        /// <param name="rule"></param>
        /// <returns></returns>
        public OperationProps GetOperation(JToken rule)
        {
            if (rule is JObject ruleObj)
            {
                var p = ruleObj.Properties().First();
                var operationName = p.Name;
                var operationArguments = (p.Value is JArray jArrayArgs)
                    ? jArrayArgs.ToArray()
                    : new JToken[] { p.Value };
                return new OperationProps
                {
                    Operation = operationName,
                    Arguments = operationArguments,
                };
            }

            return null;
        }

        /// inheritedDoc
        public string ResolveVariable(string value, JsonLogic2HqlConverterContext context)
        {
            return context.VariablesResolvers.ContainsKey(value)
                ? context.VariablesResolvers[value]
                : value;
        }

        private string AdjustType(object value, JsonLogic2HqlConverterContext context)
        {
            if (value == null)
                return "null";

            // todo: add parameters support! replace value with parameter reference and add parameter to the context

            // convert boolean to 1/0
            if (value is bool boolValue)
                return boolValue ? "1" : "0";

            var paramName = context.AddParameter(FixValue(value));
            return $":{paramName}";

            /*
            if (value is string stringValue)
                return $"'{stringValue}'";
            //if (value is string stringValue)
            //    return stringValue;

            return value.IsNumeric() 
                ? System.Convert.ToDouble(value).ToString()
                : value.ToString();
            */
        }

        private static object FixValue(object value)
        {
            if (value is string stringValue)
            {
                var guidValue = stringValue.ToGuidOrNull();
                if (guidValue != null)
                    return guidValue;
            }

            return value;
        }
    }
}