using Abp.Dependency;
using Abp.Web.Models;
using System;

namespace Shesha.Exceptions
{
    /// <summary>
    /// Shesha exception to ErrorInfo converter
    /// </summary>
    public class ShaExceptionToErrorInfoConverter : IExceptionToErrorInfoConverter, ITransientDependency
    {
        public IExceptionToErrorInfoConverter Next { set; private get; }

        public ErrorInfo Convert(Exception exception)
        {
            var result = Next.Convert(exception);

            result.Details = !string.IsNullOrWhiteSpace(result.Details)
                ? result.Details
                : exception.Message;

            return result;
        }
    }
}
