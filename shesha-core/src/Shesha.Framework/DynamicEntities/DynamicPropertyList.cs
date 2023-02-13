using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// List of dynamic properties
    /// </summary>
    public class DynamicPropertyList: List<DynamicProperty>
    {
        /// <summary>
        /// Add new property to the list
        /// </summary>
        /// <param name="propertyName"></param>
        /// <param name="propertyType"></param>
        public void Add(string propertyName, Type propertyType)
        {
            Add(new DynamicProperty { 
                PropertyName = propertyName,
                PropertyType = propertyType,
            });
        }
    }
}