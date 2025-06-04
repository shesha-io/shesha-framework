using System.Collections.Generic;

namespace Shesha.FormTemplates.DetailsView
{
    public class DetailsViewExtensionJson
    {
        public string ModelType { get; set; }
        public bool ShowKeyInformationBar { get; set; }
        public List<string> KeyInformationBarProperties { get; set; } = new List<string>();
        public bool AddChildTables { get; set; }
        public List<string> ChildTablesList { get; set; } = new List<string>();
    }
}
