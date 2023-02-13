using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.WebUtilities;
using System.IO;
using System.Text;

namespace Shesha.Tests.DynamicEntities.Mvc
{
    public class TestHttpRequestStreamReaderFactory : IHttpRequestStreamReaderFactory
    {
        public TextReader CreateReader(Stream stream, Encoding encoding)
        {
            return new HttpRequestStreamReader(stream, encoding);
        }
    }
}
