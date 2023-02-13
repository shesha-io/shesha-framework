using System;

namespace Shesha.EntityHistory
{
    [AttributeUsage(AttributeTargets.Property)]
    public class DisplayChildAuditTrailAttribute : Attribute
    {
        public string[] AuditedFields { get; set; }

    }
}