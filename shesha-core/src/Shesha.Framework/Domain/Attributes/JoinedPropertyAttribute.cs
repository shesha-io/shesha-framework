using System;

namespace Shesha.Domain.Attributes
{
    /// <summary>
    /// Indicates that properties of current entity are stored in a separate joined table
    /// </summary>
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Class, Inherited = true)]
    public class JoinedPropertyAttribute: Attribute
    {
        /// <summary>
        /// Joined table name
        /// </summary>
        public string TableName { get; set; }

        /// <summary>
        /// Schema of joined table
        /// </summary>
        public string? Schema { get; set; }

        /// <summary>
        /// Default constructor
        /// </summary>
        /// <param name="tableName"></param>
        public JoinedPropertyAttribute(string tableName)
        {
            TableName = tableName;
        }
    }
}
