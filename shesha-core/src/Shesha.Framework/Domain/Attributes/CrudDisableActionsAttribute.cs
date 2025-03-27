using System;

namespace Shesha.Domain.Attributes
{
    [AttributeUsage(AttributeTargets.Class, Inherited = true)]
    public class CrudDisableActionsAttribute: Attribute
    {
        public CrudActions Disable { get; set; }

        public CrudDisableActionsAttribute(CrudActions disable)
        {
            Disable = disable;
        }
    }

    [Flags]
    public enum CrudActions
    {
        None = 0,
        Create = 1,
        Read = 2,
        Update = 4,
        Delete = 8,
        All = 15,
    }
}
