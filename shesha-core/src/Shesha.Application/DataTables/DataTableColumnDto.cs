using Abp.AutoMapper;
using System;
using System.ComponentModel;

namespace Shesha.DataTables
{
    /// <summary>
    /// Datatable column DTO
    /// </summary>
    [AutoMapFrom(typeof(DataTableColumn))]
    public class DataTableColumnDto
    {
        /// <summary>
        /// Name of the property in the model
        /// </summary>
        public string PropertyName { get; set; }

        /// <summary>
        /// Column name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Caption
        /// </summary>
        public string Caption { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Data type
        /// </summary>
        public string DataType { get; set; }

        /// <summary>
        /// Reference list name
        /// </summary>
        public string ReferenceListName { get; set; }

        /// <summary>
        /// Reference list namespace
        /// </summary>
        public string ReferenceListNamespace { get; set; }

        /// <summary>
        /// Entity type short alias
        /// </summary>
        public string EntityReferenceTypeShortAlias { get; set; }

        /// <summary>
        /// Autocomplete url
        /// </summary>
        public string AutocompleteUrl { get; set; }

        /// <summary>
        /// Allow selection of inherited entities, is used in pair with <seealso cref="AutocompleteUrl"/> 
        /// </summary>
        public bool AllowInherited { get; set; }

        /// <summary>
        /// Indicates is column filterable or not
        /// </summary>
        public bool IsFilterable { get; set; }

        /// <summary>
        /// Indicates is column sortable or not
        /// </summary>
        public bool IsSortable { get; set; }
    }
}
