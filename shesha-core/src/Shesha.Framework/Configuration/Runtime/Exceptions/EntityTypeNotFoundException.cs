using System;

namespace Shesha.Configuration.Runtime.Exceptions
{
    /// <summary>
    /// Entity type not found exception
    /// </summary>
    public class EntityTypeNotFoundException : Exception
    {
        public string ClassNameOrAlias { get; set; }

        public EntityTypeNotFoundException (string classNameOrAlias): base($"Entity with class name or alias '{classNameOrAlias}' not found")
        {
            ClassNameOrAlias = classNameOrAlias;
        }
    }
}
