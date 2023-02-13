using System;
using System.Linq;
using Abp.Domain.Entities;
using Shesha.Utilities;

namespace Shesha.EntityHistory
{
    [AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
    public class DisplayManyToOneAuditTrailAttribute : Attribute
    {
        public Type ManyToOneEntityType { get; set; }

        public string DisplayName { get; set; }

        public string RelatedEntityField { get; set; }

        public string NameField { get; set; }

        public string[] AuditedFields { get; set; }

        public DisplayManyToOneAuditTrailAttribute(Type manyToOneEntityType)
        {
            ManyToOneEntityType = manyToOneEntityType;
            DisplayName = manyToOneEntityType.Name.ToFriendlyName();
        }
    }
}