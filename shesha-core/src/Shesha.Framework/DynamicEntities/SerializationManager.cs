using Abp.Dependency;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Shesha.DynamicEntities.Dtos;
using Shesha.DynamicEntities.Json;
using Shesha.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    /// inheritedDoc
    public class SerializationManager : ISerializationManager, ITransientDependency
    {
        /// inheritedDoc
        public object DeserializeProperty(Type propertyType, string value)
        {
            return JsonConvert.DeserializeObject(value, propertyType);
        }

        /// inheritedDoc
        public string SerializeProperty(EntityPropertyDto propertyDto, object value)
        {
            switch (propertyDto.DataType) 
            {
                case DataTypes.Date:
                {
                    var settings = new JsonSerializerSettings()
                    {
                        Converters = new List<JsonConverter>() { new IsoDateTimeConverter() { DateTimeFormat = "yyyy'-'MM'-'dd" } },
                    };
                    return JsonConvert.SerializeObject(value, settings);
                }
                default:
                    return JsonConvert.SerializeObject(value);
            }
        }
    }
}
