using System;

namespace Shesha.Exceptions
{
    public class ActivatorException: Exception
    {
        public Type RequestedType { get; private set; }

        public ActivatorException(Type requestedType) : this(requestedType, $"Failed to create instance of type '{requestedType.FullName}'")
        {
            
        }

        public ActivatorException(Type requestedType, string message) : base(message) 
        {
            RequestedType = requestedType;
        }        
    }
}
