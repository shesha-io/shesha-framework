namespace Boxfusion.SheshaFunctionalTests.Common.Application.Utils.Models
{
    public class CacheItemTypeAnalysisResult
    {
        public string Name { get; set; }
        public Type Type { get; set; }
        public bool IsSerializable { get; set; }
        public bool HasCircularReferences { get; set; }
        public bool ContainsComplexTypes { get; set; }
        public string JsonCompatibility { get; set; }
    }
}
