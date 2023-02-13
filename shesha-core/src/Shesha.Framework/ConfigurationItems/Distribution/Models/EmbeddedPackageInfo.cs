using System;
using System.Reflection;

namespace Shesha.ConfigurationItems.Distribution.Models
{
    /// <summary>
    /// Configuration package attached as an embedded resource
    /// </summary>
    public class EmbeddedPackageInfo
    {
        /// <summary>
        /// Assembly
        /// </summary>
        public Assembly Assembly { get; set; }

        /// <summary>
        /// Embedded resource name
        /// </summary>
        public string ResourceName { get; set; }

        /// <summary>
        /// Package date
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// Package version
        /// </summary>
        public string Version { get; set; }

        public EmbeddedPackageInfo(Assembly assembly, string resourceName, DateTime date, string version)
        {
            Assembly = assembly;
            ResourceName = resourceName;
            Date = date;
            Version = version;
        }
    }
}
