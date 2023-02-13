using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Extensions.Primitives;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
namespace Shesha.DynamicEntities
{
    /// <summary>
    /// ASP.Net Core register Controller at runtime
    /// https://stackoverflow.com/questions/46156649/asp-net-core-register-controller-at-runtime
    /// </summary>
    public class SheshaActionDescriptorChangeProvider : IActionDescriptorChangeProvider
    {
        public static SheshaActionDescriptorChangeProvider Instance { get; } = new SheshaActionDescriptorChangeProvider();

        public CancellationTokenSource TokenSource { get; private set; }

        public bool HasChanged { get; set; }

        public IChangeToken GetChangeToken()
        {
            TokenSource = new CancellationTokenSource();
            return new CancellationChangeToken(TokenSource.Token);
        }
    }
}
