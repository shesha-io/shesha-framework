using Newtonsoft.Json;
using System;

namespace Shesha.Json
{
    [JsonConverter(typeof(JsonStringConverter))]
    public class JsonString : IHasGetJson
    {
        public string Value { get; private set; }
        public JsonString(string value)
        {
            Value = value;

        }

        public string GetJson()
        {
            return Value;
        }
    }
}
