using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Swashbuckle.AspNetCore.SwaggerGen;
using System;

namespace Shesha.Settings.Json
{
    public class NullToDefaultConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType)
        {
            var defaultValue = objectType.GetDefaultValue();
            return defaultValue != null;
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            var token = JToken.Load(reader);
            if (token.Type == JTokenType.Null)
                // here I will add a logger to get all faulty calls
                return objectType.GetDefaultValue();
            return token.ToObject(objectType); // Deserialize using default serializer
        }

        // Return false I don't want default values to be written as null
        public override bool CanWrite => false;

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }
    }
}
