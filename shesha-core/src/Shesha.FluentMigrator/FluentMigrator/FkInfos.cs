using System.Collections.Generic;

namespace Shesha.FluentMigrator
{
    /// <summary>
    /// List of foreign keys
    /// </summary>
    public class FkInfos : List<FkInfo>
    {
        /// <summary>
        /// Adds new foreign key info to the list
        /// </summary>
        /// <param name="foreignTable"></param>
        /// <param name="foreignColumn"></param>
        /// <param name="masterTable"></param>
        public void Add(string foreignTable, string foreignColumn, string masterTable)
        {
            Add(new FkInfo()
            {
                ForeignTable = foreignTable,
                ForeignColumn = foreignColumn,
                MasterTable = masterTable
            });
        }
    }
}
