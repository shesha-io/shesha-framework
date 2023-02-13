using System;
using Abp.Json;

namespace Shesha.EntityHistory
{
    [AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
    public class PropertyChangeToStopAuditTrailAttribute : Attribute
    {
        public string PropertyName { get; set; }
        public string PropertyValue { get; set; }

        public PropertyChangeToStopAuditTrailAttribute(string propertyName, string propertyValue)
        {
            PropertyName = propertyName;
            PropertyValue = propertyValue;
        }
    }
}