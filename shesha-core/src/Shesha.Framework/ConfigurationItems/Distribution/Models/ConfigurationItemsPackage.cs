using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;

namespace Shesha.ConfigurationItems.Distribution.Models
{
    /// <summary>
    /// Configuration Items Package. Describe export file
    /// </summary>
    public class ConfigurationItemsPackage: IDisposable
    {
        /// <summary>
        /// Packed items
        /// </summary>
        public List<ConfigurationItemsPackageItem> Items { get; set; } = new List<ConfigurationItemsPackageItem>();

        private ZipArchive _zip;

        public ConfigurationItemsPackage(ZipArchive zip)
        {
            _zip = zip;
        }

        public void Dispose()
        {
            _zip?.Dispose();
        }
    }

    /// <summary>
    /// Package item
    /// </summary>
    public class ConfigurationItemsPackageItem
    { 
        /// <summary>
        /// Module name
        /// </summary>
        public string ModuleName { get; set; }

        /// <summary>
        /// Front-end Application Key
        /// </summary>
        public string ApplicationKey { get; set; }

        /// <summary>
        /// Item type
        /// </summary>
        public string ItemType { get; set; }

        /// <summary>
        /// File name in the zip archive
        /// </summary>
        public string FileName { get; set; }

        /// <summary>
        /// Stream accessor
        /// </summary>
        public Func<Stream> StreamGetter { get; set; }

        /// <summary>
        /// Corresponding importer
        /// </summary>
        public IConfigurableItemImport Importer { get; set; }
    }
}