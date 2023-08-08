using Newtonsoft.Json;
using Shesha.JsonEntities.Converters;

namespace Shesha.JsonEntities
{
    [JsonConverter(typeof(JsonEntityConverter))]
    public class JsonEntity : IJsonEntity
    {
        string __className;

        public virtual string _className
        { 
            get
            {
                return __className ??= this.GetType().FullName;
            } 
        }

        public virtual string GetJson()
        {
            return JsonConvert.SerializeObject(this, Formatting.None, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
                // it is not working... :(
                //Converters = new List<JsonConverter> { new JsonEntityReferenceConverter() };
            });
        }
    }
}
