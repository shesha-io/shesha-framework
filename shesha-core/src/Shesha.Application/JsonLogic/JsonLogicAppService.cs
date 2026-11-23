using Abp.Runtime.Validation;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Shesha.JsonLogic.Dtos;
using System;

namespace Shesha.JsonLogic
{
    public class JsonLogicAppService : SheshaAppServiceBase
    {
        private readonly IJsonLogicConstantFolder _folder;

        public JsonLogicAppService(IJsonLogicConstantFolder folder)
        {
            _folder = folder;
        }

        public JsonLogicEvaluateResponse Evaluate(JsonLogicEvaluateInput input)
        {
            JToken logic;
            try
            {
                logic = JToken.Parse(input.Expression);
            }
            catch (Exception e)
            {
                throw new AbpValidationException($"Expression is not valid JSON: {e.Message}");
            }

            var folded = _folder.Fold(logic);
            return new JsonLogicEvaluateResponse
            {
                Expression = folded.ToString(Formatting.None),
            };
        }
    }
}
