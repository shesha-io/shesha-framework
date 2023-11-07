using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Services.StoredFiles.Options
{
    public class CloudStorageOptions
    {
        public const string CloudStorageConfigurations = "CloudStorage";

        public string ContainerName { get; set; }

        public string DirectoryName { get; set; }
    }
}
