using System;

namespace Shesha.Domain.Attributes
{
    /// <summary>
    /// Allows to define insertion and updating rules. Is used for one-way fields (e.g. FullName is calculated on the server and we can't insert update it)
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    public class ReadonlyPropertyAttribute : Attribute
    {
        /// <summary>
        /// If true, NH will include this property to the insert sql 
        /// </summary>
        public bool Insert { get; set; }

        /// <summary>
        /// If true, NH will include this property to the update sql 
        /// </summary>
        public bool Update { get; set; }
    }
}
