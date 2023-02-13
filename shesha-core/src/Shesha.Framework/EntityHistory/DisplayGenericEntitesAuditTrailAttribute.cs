using System;
using Shesha.Domain;

namespace Shesha.EntityHistory
{
    [AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
    public class DisplayGenericEntitesAuditTrailAttribute : Attribute
    {
        public Type EntityType { get; set; }

        public string OwnerIdField { get; set; }
        
        public string OwnerTypeField { get; set; }

        public string DisplayName { get; set; }

        public string NameField { get; set; }

        public string CategoryField { get; set; }

        public object CategoryValue { get; set; }

        public DisplayGenericEntitesAuditTrailAttribute(Type entityType)
        {
            EntityType = entityType;
        }
    }
}