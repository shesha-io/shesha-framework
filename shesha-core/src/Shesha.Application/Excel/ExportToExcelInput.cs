using Shesha.Application.Services.Dto;
using System.Collections.Generic;

namespace Shesha.Excel
{
    /// <summary>
    /// Export to excel input
    /// </summary>
    public class ExportToExcelInput: PropsFilteredPagedAndSortedResultRequestDto
    {
        public string EntityType { get; set; }
        public List<ExcelColumn> Columns { get; set; } = new List<ExcelColumn>();
    }

    /// <summary>
    /// list of excel columns
    /// </summary>
    public class ExcelColumn 
    { 
        public string PropertyName { get; set; }
        public string Label { get; set; }
    }
}
