using System;
using System.Threading.Tasks;

namespace Shesha.DataTables
{
    /// <summary>
    /// Datatable helper
    /// </summary>
    public interface IDataTableHelper
    {
        /// <summary>
        /// Get column properties by type of model and property name
        /// </summary>
        /// <param name="rowType">Type of model (table row)</param>
        /// <param name="propName">Name of property. Supports nested properties with dot notation</param>
        /// <param name="name">Name of the column, leave empty to fill with default name</param>
        /// <returns></returns>
        [Obsolete]
        DataTablesDisplayPropertyColumn GetDisplayPropertyColumn(Type rowType, string propName, string name = null);

        /// <summary>
        /// Get column properties by type of model and property name
        /// </summary>
        /// <param name="rowType">Type of model (table row)</param>
        /// <param name="propName">Name of property. Supports nested properties with dot notation</param>
        /// <param name="name">Name of the column, leave empty to fill with default name</param>
        /// <returns></returns>
        Task<DataTablesDisplayPropertyColumn> GetDisplayPropertyColumnAsync(Type rowType, string propName, string name = null);        
    }
}
