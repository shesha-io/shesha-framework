using System;
using System.Reflection;

namespace Shesha.CodeGeneration
{
    public class TableColumn
    {
        public string ColumnName { get; set; }
        public string PropertyName { get; set; }
        public Type DataType { get; set; }
        public PropertyInfo Property { get; set; }
        public int Index { get; set; }
        public int? Size { get; set; }
        public int? Precision { get; set; }
    }
}
