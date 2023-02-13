using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace Shesha.Excel
{
    /// <summary>
    /// Excel utility
    /// </summary>
    public interface IExcelUtility
    {
        /// <summary>
        /// Read data to excel stream
        /// </summary>
        /// <param name="rowType"></param>
        /// <param name="list"></param>
        /// <param name="columns"></param>
        /// <param name="sheetName"></param>
        /// <returns></returns>
        Task<MemoryStream> ReadToExcelStreamAsync(Type rowType, IEnumerable<Dictionary<string, object>> list, IList<ExcelColumn> columns, string sheetName);
    }
}
