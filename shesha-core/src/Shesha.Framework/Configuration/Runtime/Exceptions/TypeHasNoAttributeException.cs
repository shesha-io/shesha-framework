using System;

namespace Shesha.Configuration.Runtime.Exceptions
{
    /// <summary>
    /// Type has no attribute exception
    /// </summary>
    public class TypeHasNoAttributeException : Exception
    {
        public Type Type { get; set; }
        public Type AttributeType { get; set; }

        public TypeHasNoAttributeException(Type type, Type attributeType) : base($"Type '{type.FullName}' is not decorated with attribute '{attributeType.FullName}'")
        {
            Type = type;
            AttributeType = attributeType;
        }
    }
}
