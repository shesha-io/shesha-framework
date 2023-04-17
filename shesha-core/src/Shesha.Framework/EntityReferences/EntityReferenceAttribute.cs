using System;

namespace Shesha.EntityReferences
{
    [AttributeUsage(AttributeTargets.Property)]
    public class EntityReferenceAttribute: Attribute
    {
        public string[] AllowableTypes { get; internal set; } = new string[0];
        public bool StoreDisplayName { get; internal set; } = false;

        public string IdColumnName { get; set; } = null;
        public string ClassNameColumnName { get; set; } = null;
        public string DisplayNameColumnName { get; set; } = null;

        public EntityReferenceAttribute(string[] allowableTypes, bool storeDisplayName)
        {
            AllowableTypes = allowableTypes;
            StoreDisplayName = storeDisplayName;
        }
        public EntityReferenceAttribute(string[] allowableTypes)
        {
            AllowableTypes = allowableTypes;
        }
        public EntityReferenceAttribute(bool storeDisplayName)
        {
            StoreDisplayName = storeDisplayName;
        }
        public EntityReferenceAttribute()
        {
        }
    }
}
