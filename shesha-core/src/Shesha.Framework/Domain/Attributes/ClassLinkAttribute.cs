using System;

namespace Shesha.Domain.Attributes
{
    [AttributeUsage(AttributeTargets.Property)]
    public class ClassLinkAttribute : Attribute // , IMetadataAware
    {
        public Type BaseType { get; set; }
        public Type ComparerType { get; set; }
        public bool UseUids { get; set; }

        public ClassLinkAttribute()
        {

        }

        public ClassLinkAttribute(Type baseType)
        {
            BaseType = baseType;
        }

        //public void OnMetadataCreated(ModelMetadata metadata)
        //{
        //    var sheshaMetadata = metadata.Shesha();

        //    sheshaMetadata.EditorControl = GenericEditorControl.ClassDropdown;
        //    sheshaMetadata.ClassDropdownBaseClass = BaseType;
        //    sheshaMetadata.ClassDropdownComparerType = ComparerType;
        //    sheshaMetadata.ClassDropdownUseUids = UseUids;
        //    metadata.TemplateHint = "ClassDropdown";
        //}
    }
}
