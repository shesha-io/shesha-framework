using System;

namespace Shesha.Attributes
{
    [AttributeUsage(AttributeTargets.Assembly)]
    public class TablePrefixAttribute : Attribute
    {
        public string Prefix { get; set; }

        public TablePrefixAttribute(string prefix)
        {
            Prefix = prefix;
        }
    }
}
