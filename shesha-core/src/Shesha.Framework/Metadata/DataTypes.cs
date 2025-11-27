using System;

namespace Shesha.Metadata
{
    /// <summary>
    /// Data types
    /// </summary>
    public static class DataTypes
    {
        public const string Guid = "guid";
        public const string String = "string";
        public const string Number = "number";
        public const string Date = "date";
        public const string Time = "time";
        public const string DateTime = "date-time";
        public const string EntityReference = "entity";
        public const string File = "file";
        public const string ReferenceListItem = "reference-list-item";
        public const string Boolean = "boolean";
        public const string Array = "array";
        public const string Object = "object";
        public const string Geometry = "geometry";

        // DataFormat for this data type should contain the name of the UI component (it is used only for binding to the UI and is not used in the backend)
        public const string Advanced = "advanced";
    }


    /// <summary>
    /// Custom array formats
    /// </summary>
    public static class ArrayFormats
    {
        /// <summary>
        /// Simple values (stored as Json)
        /// </summary>
        public const string Simple = "simple";
        /// <summary>
        /// Referencing entities
        /// </summary>
        public const string EntityReference = "entity";
        /// <summary>
        /// Many to many Entities
        /// </summary>
        public const string ManyToManyEntities = "many-entity";
        /// <summary>
        /// Child Entities (regular Entity but used only as part of parent Entity)
        /// </summary>
        public const string ChildEntities = "child-entity";
        /// <summary>
        /// Child objects (any Json object)
        /// </summary>
        public const string ChildObjects = "object";
        /// <summary>
        /// Multi value Reference list item
        /// </summary>
        public const string MultivalueReferenceList = "multivalue-reference-list";
    }

    /// <summary>
    /// Custom string formats
    /// </summary>
    public static class StringFormats 
    {
        public const string Singleline = "singleline";
        public const string Multiline = "multiline";
        public const string Html = "html";
        public const string Json = "json";
        public const string Javascript = "javascript";
        public const string Password = "password";
        public const string EmailAddress = "email";
        public const string PhoneNumber = "phone";
        public const string Url = "url";        
    }

    /// <summary>
    /// Custom number formats
    /// </summary>
    public static class NumberFormats
    {
        public const string Float = "float";
        [Obsolete("Use 'float' instead")]
        public const string Double = "double";
        public const string Int32 = "int32";
        public const string Int64 = "int64";
        public const string Decimal = "decimal";
    }

    public static class ObjectFormats
    {
        public const string Object = "object";
        public const string Interface = "interface";
    }

    public static class EntityFormats
    {
        public const string Entity = "entity";
        public const string GenericEntity = "generic-entity";
    }
}