namespace Shesha.Metadata
{
    /// <summary>
    /// Data type and format info
    /// </summary>
    public class DataTypeInfo
    {
        /// <summary>
        /// Data Type
        /// </summary>
        public string DataType { get; set; }

        /// <summary>
        /// Data format
        /// </summary>
        public string? DataFormat { get; set; }

        /// <summary>
        /// Object type
        /// </summary>
        public string? ObjectType { get; set; }

        public string? ListForeignProperty { get; set; }

        public DataTypeInfo(string dataType)
        {
            DataType = dataType;
        }

        public DataTypeInfo(string dataType, string? dataFormat): this(dataType)
        {
            DataFormat = dataFormat;
        }

        public DataTypeInfo(string dataType, string? dataFormat, string? objectType) : this(dataType, dataFormat)
        {
            ObjectType = objectType;
        }
    }
}
