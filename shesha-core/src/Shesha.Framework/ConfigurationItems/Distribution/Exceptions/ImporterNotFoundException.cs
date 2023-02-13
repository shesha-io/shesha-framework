using System;

namespace Shesha.ConfigurationItems.Distribution.Exceptions
{
    /// <summary>
    /// Importer not found exception
    /// </summary>
    public class ImporterNotFoundException: Exception
    {
        public ImporterNotFoundException(string itemType): base($"Importer for the item type '{itemType}' not found")
        {
            ItemType = itemType;
        }

        public string ItemType { get; private set; }
    }
}
