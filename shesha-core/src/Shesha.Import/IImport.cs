using System;
using System.Threading;
using Shesha.Domain;

namespace Shesha.Import
{
    public interface IImport<T> where T : ImportResult
    {
        void Import(Guid importResultId, CancellationToken cancellationToken);
    }
}
