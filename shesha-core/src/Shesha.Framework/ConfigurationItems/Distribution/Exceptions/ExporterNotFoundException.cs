using System;

namespace Shesha.ConfigurationItems.Distribution.Exceptions
{
    /// <summary>
    /// Exporter not found exception
    /// </summary>
    public class ExporterNotFoundException : Exception
    {
        public ExporterNotFoundException(string itemType): base($"Exporter for the item type '{itemType}' not found")
        {
            ItemType = itemType;
        }

        public string ItemType { get; private set; }
    }
}
