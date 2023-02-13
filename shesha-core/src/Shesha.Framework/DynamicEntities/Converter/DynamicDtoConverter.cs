using Abp.Json;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Shesha.JsonLogic;
using System;

namespace Shesha.DynamicEntities.Converter
{
    public class DynamicDtoConverter : JsonConverter
    {
        public override bool CanRead => false;
        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            JObject json = null;
            // if there is a Dto with _jObject field and _jObject is not empty - just use it instead of full serialization
            if (value is IHasJObjectField obj && !obj._jObject.IsNullOrEmpty())
                json = obj._jObject;
            else
            {
                var o = new JObject();
                ObjectToJsonExtension.ObjectToJObject(value, o);
                json = o;
            }

            writer.Formatting = Formatting.None;
            json.WriteTo(writer);
        }

        public override bool CanConvert(Type objectType)
        {
            // Use only as Attribute
            return false;
        }
    }
}
