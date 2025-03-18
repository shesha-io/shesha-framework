using System;

namespace Shesha.Domain.Attributes
{
    /// <summary>
    /// Attribute for identification many-to-many relations. 
    /// It's hard to identify many-to-many by conventions for legacy projects. And ClassMapping{} 
    /// doesn't override other types of relations(if it has been set to one-to-many or any other by conventions) to many-to-many. 
    /// Looks like a NHibernate bug, so easiest way for now use this attribute.
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    public class ManyToManyAttribute : Attribute
    {
        public ManyToManyAttribute(string table, string childColumn, string keyColumn, string @where)
        {
            Table = table;
            ChildColumn = childColumn;
            KeyColumn = keyColumn;
            Where = @where;
        }
        public ManyToManyAttribute(string? table, string? childColumn, string? keyColumn)
        {
            Table = table;
            ChildColumn = childColumn;
            KeyColumn = keyColumn;
        }
        public ManyToManyAttribute(string table, string childColumn)
            : this(table, childColumn, null)
        { }

        public ManyToManyAttribute(string table)
            : this(table, null, null)
        { }

        public ManyToManyAttribute()
            : this(null, null, null)
        { }

        public ManyToManyAttribute(string table, string childColumn, string keyColumn, string @where, bool autoGeneration)
            : this(table, childColumn, keyColumn, @where)
        {
            AutoGeneration = autoGeneration;
        }
        public ManyToManyAttribute(string table, string childColumn, string keyColumn, bool autoGeneration)
            : this(table, childColumn, keyColumn)
        {
            AutoGeneration = autoGeneration;
        }
        public ManyToManyAttribute(string table, string childColumn, bool autoGeneration)
            : this(table, childColumn, null)
        {
            AutoGeneration = autoGeneration;
        }
        public ManyToManyAttribute(string table, bool autoGeneration)
            : this(table, null, null)
        {
            AutoGeneration = autoGeneration;
        }
        public ManyToManyAttribute(bool autoGeneration)
            : this(null, null, null)
        {
            AutoGeneration = autoGeneration;
        }

        /// <summary>
        /// Indicates that the database table will be generated automatically.
        /// </summary>
        public bool AutoGeneration { get; set; }

        /// <summary>
        /// It can be set either to the table you link to or the intermediate link table (only if it has a mapping)
        /// </summary>
        public string? Table { get; set; }

        /// <summary>
        /// Column to filter by
        /// </summary>
        public string? ChildColumn { get; set; }

        /// <summary>
        /// Column to load entity from
        /// </summary>
        public string? KeyColumn { get; set; }

        /// <summary>
        /// SQL Filter
        /// </summary>
        public string? Where { get; set; }

        /// <summary>
        /// SQL Order By clause
        /// </summary>
        public string? OrderBy { get; set; }
    }
}
