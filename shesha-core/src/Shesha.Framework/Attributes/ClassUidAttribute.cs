using System;

namespace Shesha.Attributes
{
    /// <summary>
    /// Sets an unique Id of the class. Is used for references instead of class name
    /// </summary>
    [AttributeUsage(AttributeTargets.Class)]
    public class ClassUidAttribute : Attribute
    {
        public string Uid { get; set; }

        public ClassUidAttribute(string uid)
        {
            Uid = uid;
        }
    }
}
