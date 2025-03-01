using System;

namespace Shesha.Exceptions
{
    /// <summary>
    /// Indicates that requested method not found in a specified type
    /// </summary>
    public class MethodNotFoundException : Exception
    {
        public Type OwnerType { get; private set; }
        public string MethodName { get; private set; }

        public MethodNotFoundException(Type type, string methodName): base($"Method '{methodName}' not found in type '{type.FullName}'")
        {
            OwnerType = type;
            MethodName = methodName;
        }
    }
}
