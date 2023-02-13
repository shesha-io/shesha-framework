namespace Shesha.DataTables
{
    /// <summary>
    /// Data table column
    /// </summary>
    public abstract class DataTableColumn
    {
        /// <summary>
        /// Default constructor
        /// </summary>
        protected internal DataTableColumn()
        {
            // default values
            IsSortable = true;
            IsFilterable = true;
            IsDynamic = false;
        }

        /// <summary>
        /// Name of the property in the model
        /// </summary>
        public string PropertyName { get; set; }

        /// <summary>
        /// Column name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Caption of the column
        /// </summary>
        public string Caption { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// If true, indicates that the column is sortable
        /// </summary>
        public bool IsSortable { get; set; }

        #region Reference list

        /// <summary>
        /// Reference list name
        /// </summary>
        public string ReferenceListName { get; set; }

        /// <summary>
        /// Reference list module
        /// </summary>
        public string ReferenceListModule { get; set; }

        #endregion

        #region Entity reference

        /// <summary>
        /// Type short alias of the referenced entity
        /// </summary>
        public string EntityReferenceTypeShortAlias { get; set; }

        /// <summary>
        /// Autocomplete url. Is used for column filter and inline editing
        /// </summary>
        public string AutocompleteUrl { get; set; }

        /// <summary>
        /// Allow selection of inherited entities, is used in pair with <seealso cref="AutocompleteUrl"/> 
        /// </summary>
        public bool AllowInherited { get; set; }

        #endregion

        public string DataType { get; set; }
        public string DataFormat { get; set; }

        /// <summary>
        /// If true, indicates that column is filterable
        /// </summary>
        public bool IsFilterable { get; set; }

        /// <summary>
        /// If true, indicates that the column is sortable
        /// </summary>
        public bool IsDynamic { get; set; }
    }

    public abstract class DataTableColumn<TEntity, TId>: DataTableColumn
    { 

    }
}