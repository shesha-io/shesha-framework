using Abp.Dependency;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.JsonLogic
{
    public class JsonLogicConstantFolder : IJsonLogicConstantFolder, ITransientDependency
    {
        private static readonly HashSet<string> FoldableOperators = new()
        {
            JsOperators.Now,
            JsOperators.DateAdd,
            JsOperators.DateTimeAdd,
            JsOperators.Upper,
            JsOperators.Lower,
            JsOperators.Cat,
            JsOperators.Substr,
            JsOperators.Trim,
            JsOperators.Length,
            JsOperators.Add,
            JsOperators.Subtract,
            JsOperators.Multiply,
            JsOperators.Divide,
            JsOperators.Modulo,
            JsOperators.Abs,
            JsOperators.Floor,
            JsOperators.Ceil,
            JsOperators.Round,
            JsOperators.Year,
            JsOperators.Month,
            JsOperators.Day,
        };

        private static readonly HashSet<string> NonFoldableOperators = new()
        {
            JsOperators.Var,
            JsOperators.IsSatisfied,
            "evaluate",
        };

        private readonly JsonLogic2LinqConverter _evaluator;

        public JsonLogicConstantFolder(JsonLogic2LinqConverter evaluator)
        {
            _evaluator = evaluator;
        }

        public JToken Fold(JToken logic)
        {
            if (logic is JObject obj)
            {
                if (obj.Count == 1)
                {
                    var operatorName = obj.Properties().First().Name;
                    if (FoldableOperators.Contains(operatorName) && !ContainsNonFoldable(obj) && _evaluator.TryEvaluateConstant(obj, out var value))
                        return value is null ? JValue.CreateNull() : JToken.FromObject(value);
                }

                var foldedObject = new JObject();
                foreach (var property in obj.Properties())
                    foldedObject.Add(property.Name, Fold(property.Value));
                return foldedObject;
            }

            if (logic is JArray array)
            {
                var foldedArray = new JArray();
                foreach (var item in array)
                    foldedArray.Add(Fold(item));
                return foldedArray;
            }

            return logic.DeepClone();
        }

        private static bool ContainsNonFoldable(JToken token)
        {
            if (token is JObject obj)
                return obj.Properties().Any((property) => NonFoldableOperators.Contains(property.Name) || ContainsNonFoldable(property.Value));
            if (token is JArray array)
                return array.Any(ContainsNonFoldable);
            return false;
        }
    }
}
