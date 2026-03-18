using Abp.Web.Models;
using Boxfusion.SheshaFunctionalTests.Common.Application.Utils;
using Microsoft.AspNetCore.Mvc;
using Shesha;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services
{
    public class CacheAppService : SheshaAppServiceBase
    {
        private readonly ICacheAnalyzerService _cacheAnalyzer;

        public CacheAppService(ICacheAnalyzerService cacheAnalyzer)
        {
            _cacheAnalyzer = cacheAnalyzer;
        }

        [DontWrapResult]
        [HttpPost]
        public string TestAll(bool? jsonCompatible = null, bool? hasCircularReferences = null)
        {
            var results = _cacheAnalyzer.AnalyzeCaches();
            
            if (jsonCompatible != null)
                results = results.Where(x => jsonCompatible.Value == (x.JsonCompatibility == "Compatible")).ToList();

            if (hasCircularReferences != null)
                results = results.Where(x => !x.HasCircularReferences).ToList();

            return _cacheAnalyzer.FormatResults(results);
        }
    }
}
