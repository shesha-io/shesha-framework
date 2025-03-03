using System;

namespace Shesha.Exceptions
{
    /// <summary>
    /// Indicates that requested property not found in a specified type
    /// </summary>
    public class PropertyNotFoundException : Exception
    {
        public Type OwnerType { get; private set; }
        public string PropertyName { get; private set; }

        public PropertyNotFoundException(Type type, string propertyName): base($"Property '{propertyName}' not found in type '{type.FullName}'")
        {
            OwnerType = type;
            PropertyName = propertyName;
        }
    }
}
