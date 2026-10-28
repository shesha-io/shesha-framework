using Shesha.Domain;
using System;
using System.Threading;

namespace Shesha.Import
{
    public interface IImport<T> where T : ImportResult
    {
        void Import(Guid importResultId, CancellationToken cancellationToken);
    }
}
