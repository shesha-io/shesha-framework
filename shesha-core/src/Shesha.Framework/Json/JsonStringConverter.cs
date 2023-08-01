using Newtonsoft.Json;
using System;

namespace Shesha.Json
{
    public class JsonStringConverter : JsonConverter
    {
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            var jsonContent = (value as JsonString)?.GetJson();

            if (!string.IsNullOrWhiteSpace(jsonContent))
                writer.WriteRawValue(jsonContent);
        }

        public override bool CanConvert(Type objectType)
        {
            return objectType.IsAssignableTo(typeof(JsonString));
        }

        public override bool CanRead => false;

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }
    }
}
