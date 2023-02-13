using System;
using System.Linq;
using Abp.Domain.Entities;
using Shesha.Utilities;

namespace Shesha.EntityHistory
{
    [AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
    public class DisplayManyToManyAuditTrailAttribute : Attribute
    {
        public Type ManyToManyEntityType { get; set; }

        public string DisplayName { get; set; }

        public string OwnEntityField { get; set; }

        public string RelatedEntityField { get; set; }

        public Type RelatedEntityType { get; set; }

        public bool AnyRelatedEntityType { get; set; }

        public string NameField { get; set; }

        public string[] AuditedFields { get; set; }

        public DisplayManyToManyAuditTrailAttribute(Type manyToManyEntityType, string relatedEntityField)
        {
            ManyToManyEntityType = manyToManyEntityType;
            DisplayName = manyToManyEntityType.Name.ToFriendlyName();
            RelatedEntityField = relatedEntityField;
            AnyRelatedEntityType = false;
        }
    }
}