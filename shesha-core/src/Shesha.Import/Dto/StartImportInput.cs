using Microsoft.AspNetCore.Http;

namespace Shesha.Import.Dto
{
    public class StartImportInput
    {
        public IFormFile File { get; set; }
    }
}
