using Shesha.DynamicEntities.Dtos;
using Shesha.Metadata;
using System.Collections.Generic;

namespace Shesha.Tests.DynamicEntities.Dtos
{
    /// <summary>
    /// List of property DTO, is used just to simlpify the code
    /// </summary>
    public class EntityPropertyDtoList : List<EntityPropertyDto>
    {
        public EntityPropertyDto AddString(string name, string label) 
        {
            var prop = new EntityPropertyDto { 
                DataType = DataTypes.String,
                DataFormat = StringFormats.Singleline,
                Name = name, 
                Label = label 
            };
            Add(prop);

            return prop;
        }
    }
}
