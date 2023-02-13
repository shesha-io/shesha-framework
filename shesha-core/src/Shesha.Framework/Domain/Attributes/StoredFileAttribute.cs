using System;

namespace Shesha.Domain.Attributes
{
    /// <summary>
    /// Parameters of the Stored File property which are used for initialization
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    public class StoredFileAttribute : Attribute
    {
        public bool IsVersionControlled { get; set; }
        public bool IsEncrypted { get; set; }
        public string Accept { get; set; }
    }
}
