using System;

namespace Shesha.Exceptions
{
    /// <summary>
    /// Indicates that requested field not found in a specified type
    /// </summary>
    public class FieldNotFoundException : Exception
    {
        public Type OwnerType { get; private set; }
        public string FieldName { get; private set; }

        public FieldNotFoundException(Type type, string fieldName): base($"Field '{fieldName}' not found in type '{type.FullName}'")
        {
            OwnerType = type;
            FieldName = fieldName;
        }
    }
}
