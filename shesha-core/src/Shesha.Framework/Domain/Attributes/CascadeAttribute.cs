using System;
using NHibernate.Mapping.ByCode;

namespace Shesha.Domain.Attributes
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
