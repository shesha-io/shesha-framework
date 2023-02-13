using System;
using Abp.Application.Services.Dto;


namespace Shesha.StoredFiles.Dto
{
    /// <summary>
    /// Stored File version info
    /// </summary>
    public class StoredFileVersionInfoDto : EntityDto<Guid>
    {
        /// <summary>
        /// Date of the upload
        /// </summary>
        public virtual DateTime? DateUploaded { get; set; }
        
        /// <summary>
        /// File size
        /// </summary>
        public virtual Single? Size { get; set; }

        /// <summary>
        /// User uploaded this version
        /// </summary>
        public virtual string UploadedBy { get; set; }

        /// <summary>
        /// File name
        /// </summary>
        public virtual string FileName { get; set; }

        /// <summary>
        /// Version number
        /// </summary>
        public virtual int VersionNo { get; set; }

        /// <summary>
        /// Url for version downloading
        /// </summary>
        public string Url { get; set; }
    }
}
