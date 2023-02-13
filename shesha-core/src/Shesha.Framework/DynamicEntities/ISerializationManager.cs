using Shesha.DynamicEntities.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Dynamic entity serialization manager
    /// </summary>
    public interface ISerializationManager
    {
        /// <summary>
        /// Serialize property value
        /// </summary>
        /// <param name="propertyDto"></param>
        /// <param name="value"></param>
        /// <returns></returns>
        string SerializeProperty(EntityPropertyDto propertyDto, object value);

        /// <summary>
        /// Deserialize property value
        /// </summary>
        /// <param name="propertyType"></param>
        /// <param name="value"></param>
        /// <returns></returns>
        object DeserializeProperty(Type propertyType, string value);
    }
}
