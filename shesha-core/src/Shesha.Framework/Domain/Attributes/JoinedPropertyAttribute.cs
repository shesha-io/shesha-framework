using System;

namespace Shesha.Domain.Attributes
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Class, Inherited = true)]
    public class JoinedPropertyAttribute: Attribute
    {
        public string TableName { get; set; }

        public JoinedPropertyAttribute(string tableName)
        {
            TableName = tableName;
        }
    }
}
