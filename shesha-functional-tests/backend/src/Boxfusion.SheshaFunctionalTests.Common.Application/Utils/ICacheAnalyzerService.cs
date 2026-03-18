using Boxfusion.SheshaFunctionalTests.Common.Application.Utils.Models;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Utils
{
    public interface ICacheAnalyzerService
    {
        List<CacheItemTypeAnalysisResult> AnalyzeCaches();
        string FormatResults(List<CacheItemTypeAnalysisResult> results);
    }
}
