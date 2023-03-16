using JetBrains.Annotations;

namespace Shesha.Settings
{
    /// <summary>
    /// Setting identifier. Contains name and module name
    /// </summary>
    public class SettingIdentifier
    {
        public string Name { get; set; }
        public string Module { get; set; }

        [UsedImplicitly]
        public SettingIdentifier() 
        { 
        }

        public SettingIdentifier(string name, string module)
        {
            Name = name;
            Module = module;    
        }

        public string NormalizedFullName => $"{Module}:{Name}".ToLower();
        public override int GetHashCode()
        {
            return NormalizedFullName.GetHashCode();
        }
        public override bool Equals(object obj)
        {
            return Equals(obj as SettingIdentifier);
        }

        public bool Equals(SettingIdentifier obj)
        {
            return obj != null && obj.NormalizedFullName == this.NormalizedFullName;
        }
    }
}
