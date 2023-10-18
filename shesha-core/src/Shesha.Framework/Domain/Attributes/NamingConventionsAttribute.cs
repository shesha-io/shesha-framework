using System;
using Shesha.Domain.Conventions;

namespace Shesha.Domain.Attributes
{
    [AttributeUsage(AttributeTargets.Class)]
    public class NamingConventionsAttribute: Attribute
    {
        public Type ConventionsType { get; private set; }

        public NamingConventionsAttribute(Type conventionsType) 
        {
            if (!typeof(INamingConventions).IsAssignableFrom(conventionsType))
                throw new ArgumentException($"`{nameof(conventionsType)}` must implement `{nameof(INamingConventions)}` to be used as an argument of the `{nameof(NamingConventionsAttribute)}`");

            ConventionsType = conventionsType;
        }
    }
}
