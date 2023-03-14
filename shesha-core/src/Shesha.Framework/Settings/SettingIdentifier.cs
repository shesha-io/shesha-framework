namespace Shesha.Settings
{
    /// <summary>
    /// Setting identifier. Contains name and module name
    /// </summary>
    public class SettingIdentifier
    {
        public string Name { get; set; }
        public string Module { get; set; }

        public SettingIdentifier(string name, string module)
        {
            Name = name;
            Module = module;    
        }

        public string FullName => $"{Module}:{Name}";
        public override int GetHashCode()
        {
            return FullName.GetHashCode();
        }
        public override bool Equals(object obj)
        {
            return Equals(obj as SettingIdentifier);
        }

        public bool Equals(SettingIdentifier obj)
        {
            return obj != null && obj.FullName == this.FullName;
        }
    }
}
