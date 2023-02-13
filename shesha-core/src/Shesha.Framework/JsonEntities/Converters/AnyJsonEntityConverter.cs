using Abp.Dependency;
using Abp.Json;
using Abp.Reflection;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using Shesha.DynamicEntities.Dtos;
using Shesha.Services;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Xml;
using System.Xml.Linq;

namespace Shesha.JsonEntities.Converters
{
    // ToDo AS: Don't use. Is not completed!
    [Obsolete("Don't use. Is not completed!")]
    public class AnyJsonEntityConverter : JsonConverter
    {
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            writer.WriteRawValue(((IJsonEntity)value).GetJson());
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            var obj = JObject.Load(reader);

            var _className = obj.ContainsKey(nameof(IJsonEntity._className).ToCamelCase())
                ? obj.GetValue(nameof(IJsonEntity._className).ToCamelCase()).ToString()
                : null;

            if (_className != null)
            {
                var jType = StaticContext.IocManager.Resolve<TypeFinder>().Find(t => t.FullName == _className).FirstOrDefault();
                return serializer.Deserialize(obj.CreateReader(), jType);
            }

            return null;
        }

        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof(IJsonEntity);
        }
    }

}
