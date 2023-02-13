using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.RabbitMQ.Attributes
{
    /// <summary>
    /// 
    /// </summary>
    [AttributeUsage(AttributeTargets.Class)]
    public class TypeAliasAttribute : Attribute
    {
        /// <summary>
        /// 
        /// </summary>
        public string Name { get; }
        /// <summary>
        /// 
        /// </summary>
        public bool IsDefault { get; set; }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="name"></param>
        public TypeAliasAttribute(string name)
        {
            Name = name;
            IsDefault = true;
        }
    }
}
