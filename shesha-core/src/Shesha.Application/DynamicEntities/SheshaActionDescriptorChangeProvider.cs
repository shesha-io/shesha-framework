using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Extensions.Primitives;
using System;
using System.Threading;
namespace Shesha.DynamicEntities
{
    /// <summary>
    /// ASP.Net Core register Controller at runtime
    /// https://stackoverflow.com/questions/46156649/asp-net-core-register-controller-at-runtime
    /// </summary>
    public sealed class SheshaActionDescriptorChangeProvider : IActionDescriptorChangeProvider, IDisposable
    {
        private bool _disposed;

        public static SheshaActionDescriptorChangeProvider Instance { get; } = new SheshaActionDescriptorChangeProvider();

        public CancellationTokenSource? TokenSource { get; private set; }

        public bool HasChanged { get; set; }

        public IChangeToken GetChangeToken()
        {
            TokenSource?.Dispose();
            TokenSource = new CancellationTokenSource();
            return new CancellationChangeToken(TokenSource.Token);
        }

        public void Dispose()
        {
            if (_disposed)
            {
                return;
            }

            _disposed = true;
            TokenSource?.Dispose();
        }
    }
}
