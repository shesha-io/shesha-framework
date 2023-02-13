using Abp.Domain.Entities;
using Abp.Reflection;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Services;
using System;
using JsonSerializer = Newtonsoft.Json.JsonSerializer;

namespace Shesha.JsonEntities.Converters
{
    // ToDo AS: Don't use. Is not completed!
    [Obsolete("Don't use. Is not completed!")]
    public class JsonEntityReferenceConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType)
        {
            return objectType.IsEntityType();
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            var jObj = JObject.Load(reader);
            var id = jObj?.GetValue("id");
            if (id != null)
                return StaticContext.IocManager.Resolve<IDynamicRepository>().Get(objectType, id.ToString());
            return null;
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            if (value is IEntity entity)
            {
                var entityType = entity.GetType();
                var id = entityType.GetProperty("Id")?.GetValue(entity);
                if (id != null)
                {
                    var _displayNamePropertyInfo = entityType.GetEntityConfiguration()?.DisplayNamePropertyInfo;
                    var dysplayName = _displayNamePropertyInfo != null ? _displayNamePropertyInfo.GetValue(entity).ToString() : entity.ToString();
                    serializer.Serialize(writer, new { id, _dysplayName = dysplayName });
                }
            }
        }
    }

}
