using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner.Dtos
{
    public class ImportConfigDto
    {
        public IFormFile File { get; set; }
    }
}
