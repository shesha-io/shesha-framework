namespace Shesha.Controllers.Dtos
{
    public class AssemblyInfoDto
    {
        public required string Location { get; set; }
        public string? FullName { get; set; }
        public required string Version { get; set; }
        public required string Architecture { get; set; }
        public string? Description { get; set; }
    }
}
