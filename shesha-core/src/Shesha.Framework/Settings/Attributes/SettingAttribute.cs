using System;

namespace Shesha.Settings
{
    /// <summary>
    /// Setting attribute. Is used to decorate properties of the <see cref="ISettingAccessors"/>
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    public class SettingAttribute : Attribute
    {
        public string Name { get; set; }
        public bool IsClientSpecific { get; set; }
        public string EditorFormName { get; set; }
        public bool IsUserSpecific { get; set; }
        public SettingAttribute(string name, bool isClientSpecific = false, string editorFormName = null, bool isUserSpecific = false)
        {
            Name = name;
            IsClientSpecific = isClientSpecific;
            EditorFormName = editorFormName;
            IsUserSpecific = isUserSpecific;
        }
    }
}
