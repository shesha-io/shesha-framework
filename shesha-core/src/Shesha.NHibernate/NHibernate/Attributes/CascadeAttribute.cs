using NHibernate.Mapping.ByCode;
using System;

namespace Shesha.NHibernate.Attributes
{
    [AttributeUsage(AttributeTargets.Property)]
    public class CascadeAttribute : Attribute
    {
        public CascadeAttribute(Cascade cascade)
        {
            Cascade = cascade;
        }
        public Cascade Cascade { get; set; }
    }
}
