using Abp.Application.Services.Dto;

namespace Shesha.Maintenance
{
    public class BackupDataDto : EntityDto
    {
        public string BackupPath { get; set; }
        public string ErrorMessage { get; set; }
    }
}