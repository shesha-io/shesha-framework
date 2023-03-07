namespace Shesha.FluentMigrator
{
    /// <summary>
    /// Foreign key info
    /// </summary>
    public class FkInfo
    {
        public string ForeignTable { get; set; }
        public string ForeignColumn { get; set; }
        public string MasterTable { get; set; }
        public string IndexName => GenerateIndexNameForColumn(ForeignTable, ForeignColumn);

        /// <summary>
        /// Generates standard name for the index of the foreign key column
        /// </summary>
        public static string GenerateIndexNameForColumn(string table, string column)
        {
            // NOTE: Don't change this code, it's used in the migrations
            return $"IX_{table}_{column}";
        }
    }
}
