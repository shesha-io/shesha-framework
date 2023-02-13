using System;

namespace Shesha.Attributes
{
    /// <summary>
    /// This attribute is used to link controller action to an entity action (CRUD actions and any custom actions like `export-to-excel`)
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public class EntityActionAttribute: Attribute
    {
        public string Action { get; private set; }

        public EntityActionAttribute(string action)
        {
            Action = action;
        }
    }
}
