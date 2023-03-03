using System.Collections.Generic;

namespace Shesha.ConfigurationItems.Distribution.Models
{
    /// <summary>
    /// Configuration items export result
    /// </summary>
    public class ConfigurationItemsExportResult
    {
        //

        /*
        Dependencies between items in the zip
        option 1: include dependencies of each item into the json
            pros: it works for both cases: single item export (json file) and multiple items export (zip archive)
            cons: doesn't work for items not exportad as json (e.g. workflows)
        option 2: add a single `relations` file into the zip

        all folders on the root are identified as modules except system names (e.g. [resources])
        
        1st level folders are identified as modules except system names (e.g. [resources])
        2nd level folders represent item type (e.g. form, workflow etc)
        all json files in the 2nd level folders are identified as individual items

        zip/
        ├── shesha/
        │   ├── forms/
        │   │   ├── form1.json
        │   │   └── form2.json
        │   ├── models/
        │   │   ├── organisation.json
        │   │   └── person.json
        │   ├── reference-lists/
        │   │   └── statuses.json
        │   └── workflows/
        │       ├── disconnection.json
        │       ├── new-connection.json
        │       └── GenericProcess.bpmn     <-- referenced by shesha/workflows/Disconnection.json
        └── his.bookings/
            └── forms/         


        zip/
        ├── [resources]/
        │   └── GenericProcess.bpmn     <-- referenced by shesha/workflows/Disconnection.json
        ├── package.json                <-- stores information about the package (e.g. text description, user-friendly name, version of the back-end, may even contain a list of required back-end packages)
        ├── shesha/
        │   ├── forms/
        │   │   ├── form1.json
        │   │   └── form2.json
        │   ├── models/
        │   │   ├── organisation.json
        │   │   └── person.json
        │   ├── reference-lists/
        │   │   └── statuses.json
        │   └── workflows/              <-- store workflow definition
        │       ├── disconnection.json
        │       └── new-connection.json
        └── his.bookings/
            └── forms/

        Thoughts:
        1. content file without metadata doesn't make any sense, all configurable items are stored in the DB and can be exported to json
        
        Track dependencies by the forms designer and save as part of markup
        1. implement cleanup per component
        2. implement fill dependencies per component

        */

        /// <summary>
        /// Exported items
        /// </summary>
        public List<ConfigurationItemsExportItem> Items { get; set; } = new List<ConfigurationItemsExportItem>();
    }

    public class ConfigurationItemsExportItem 
    { 
        /// <summary>
        /// Item data
        /// </summary>
        public DistributedConfigurableItemBase ItemData { get; set; }

        /// <summary>
        /// Relative path in the zip
        /// </summary>
        public string RelativePath { get; set; }

        /*
        references and dependencies
        item role: manually included/dependency
         */

        /// <summary>
        /// Corresponding exporter
        /// </summary>
        public IConfigurableItemExport Exporter { get; set; }
    }
}
