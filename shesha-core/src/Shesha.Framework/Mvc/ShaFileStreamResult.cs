using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;

namespace Shesha.Mvc
{
    /// <summary>
    /// Custom implementation of FileStreamResult
    /// </summary>
    public class ShaFileStreamResult : FileStreamResult
    {
        public ShaFileStreamResult(Stream fileStream, string contentType) : base(fileStream, contentType)
        {
        }

        public override void ExecuteResult(ActionContext context)
        {
            AllowContentDispositionHeader(context);
            base.ExecuteResult(context);
        }

        public override Task ExecuteResultAsync(ActionContext context)
        {
            AllowContentDispositionHeader(context);
            return base.ExecuteResultAsync(context);
        }

        private void AllowContentDispositionHeader(ActionContext context)
        {
            context.HttpContext.Response.Headers.Append("Access-Control-Expose-Headers", "Content-Disposition");
        }
    }
}
