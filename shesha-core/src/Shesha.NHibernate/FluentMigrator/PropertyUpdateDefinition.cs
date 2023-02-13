using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.FluentMigrator
{
    /// <summary>
    /// Property update definition
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class PropertyUpdateDefinition<T>
    {
        public T Value { get; set; }
        public bool IsSet { get; set; }

        public void Set(T value) 
        {
            Value = value;
            IsSet = true;
        }
    }
}
