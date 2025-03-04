using System;
using System.Reflection;

namespace Shesha.Configuration.Runtime.Exceptions
{
    /// <summary>
    /// Type has no attribute exception
    /// </summary>
    public class MemberHasNoAttributeException : Exception
    {
        public MemberInfo Member { get; set; }
        public Type AttributeType { get; set; }

        public MemberHasNoAttributeException(MemberInfo member, Type attributeType) : base($"Member '{member.Name}' (declaring type: {member.DeclaringType?.FullName}) is not decorated with attribute '{attributeType.FullName}'")
        {
            Member = member;
            AttributeType = attributeType;
        }
    }
}
