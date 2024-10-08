namespace Shesha.Startup
{
    /// <summary>
    /// Assembly DTO with base properties
    /// </summary>
    public class AssemblyBaseDto
    {
        public string FileName { get; set; }
        public string FileMD5 { get; set; }
        public string FileVersion { get; set; }
        public string ProductVersion { get; set; }
    }
}
