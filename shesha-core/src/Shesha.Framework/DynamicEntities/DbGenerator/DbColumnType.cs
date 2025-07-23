namespace Shesha.DynamicEntities.DbGenerator
{
    public class DbColumnType
    {
        public DbColumnTypeEnum ColumnType { get; set; }

        public int? Size { get; set; }

        public DbColumnType(DbColumnTypeEnum columnType)
        {
            ColumnType = columnType;
        }

        public DbColumnType(DbColumnTypeEnum columnType, int size)
        {
            ColumnType = columnType;
            Size = size;
        }
    }
}
