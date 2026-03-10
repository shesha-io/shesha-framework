using DocumentFormat.OpenXml.Office2010.ExcelAc;
using Shesha.Domain;
using System;
using System.Collections.Generic;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Request of the <see cref="ConfigurationStudioAppService.ExposeAsync(ExposeRequest)"/>
    /// </summary>
    public class ExposeRequest
    {
        /// <summary>
        /// Id of the destination module
        /// </summary>
        public Guid ModuleId { get; set; }
        /// <summary>
        /// Id of the destination folder
        /// </summary>
        public Guid? FolderId { get; set; }
        /// <summary>
        /// List of <see cref="ConfigurationItem"/> ids
        /// </summary>
        public List<Guid> ItemIds { get; set; } = new();
    }
}
