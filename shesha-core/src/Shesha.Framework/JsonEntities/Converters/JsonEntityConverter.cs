using Abp.Reflection;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Shesha.DynamicEntities;
using Shesha.JsonEntities.Proxy;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.Utilities;
using System;
using System.Linq;
using JsonSerializer = Newtonsoft.Json.JsonSerializer;

namespace Shesha.JsonEntities.Converters
{
    public class JsonEntityConverter : JsonConverter
    {
        public override object? ReadJson(JsonReader reader, Type objectType, object? existingValue, JsonSerializer serializer)
        {
            if (reader.TokenType == JsonToken.Null) return null;
            var jObj = JObject.Load(reader);

            var classNameProp = nameof(IJsonEntity._className).ToCamelCase().NotNull();
            var _className = jObj.ContainsKey(classNameProp)
                ? jObj.GetValue(classNameProp)?.ToString()
                : null;
            
            var classNameObjectType = _className != null 
                ? StaticContext.IocManager.Resolve<ITypeFinder>().Find(t => t.FullName == _className).FirstOrDefault()
                : objectType;

            if (classNameObjectType == typeof(JsonEntity) && _className == null)
                throw new JsonSerializationException("JsonEntity must contain \"_className\" field");

            if (classNameObjectType == null)
                throw new JsonSerializationException($"Type for \"_className\": \"{_className}\" not found. Type of field: \"{objectType?.FullName ?? "undefined"}\"");

            var proxyFactory = StaticContext.IocManager.Resolve<IJsonEntityProxyFactory>();
            return proxyFactory.GetNewProxiedJsonEntity(classNameObjectType, jObj);
        }

        public override void WriteJson(JsonWriter writer, object? value, JsonSerializer serializer)
        {
            writer.Formatting = Formatting.None;
            if (value is IJsonEntityProxy proxy)
                JsonEntityProxy.GetJson(proxy).WriteTo(writer);
            else
                ObjectToJsonExtension.GetJObjectFromObject(value).WriteTo(writer);
        }

        public override bool CanConvert(Type objectType)
        {
            return objectType.IsAssignableTo(typeof(IJsonEntity));
        }
    }
}
