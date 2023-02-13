using Abp.Application.Services.Dto;

namespace Shesha.Maintenance
{
    public class BackupFileDto : EntityDto
    {
        public string FileName { get; set; }
    }
}