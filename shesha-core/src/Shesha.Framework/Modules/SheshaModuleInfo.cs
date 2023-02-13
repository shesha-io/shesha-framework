namespace Shesha.Modules
{
    /// <summary>
    /// Shesha module info
    /// </summary>
    public class SheshaModuleInfo
    {
        /// <summary>
        /// Module name
        /// </summary>
        public string Name { get; set; }
        
        /// <summary>
        /// Friendly name
        /// </summary>
        public string FriendlyName { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Publisher name
        /// </summary>
        public string Publisher { get; set; }

        /// <summary>
        /// Is editable
        /// </summary>
        public bool IsEditable { get; set; }

        /// <summary>
        /// Is root module
        /// </summary>
        public bool IsRootModule { get; set; }

        /// <summary>
        /// Version no
        /// </summary>
        public string VersionNo { get; set; }

        public bool UseAssemblyVersion { get; set; }

        public SheshaModuleInfo(string name)
        {
            Name = name;
            UseAssemblyVersion = true;
        }

        public SheshaModuleInfo(string name, string versionNo)
        {
            Name = name;
            VersionNo = versionNo;            
        }
    }
}
