using Abp.Domain.Uow;
using GraphQL.Execution;
using GraphQL.Validation;
using System;
using System.Threading.Tasks;

namespace Shesha.GraphQL.UnitOfWork
{
    public sealed class GraphQLUnitOfWorkListener : IDocumentExecutionListener, IDisposable
    {
        private IUnitOfWorkCompleteHandle _unitOfWorkCompleteHandle;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private bool _disposed;

        public IUnitOfWorkManager UnitOfWorkManager => _unitOfWorkManager;

        public GraphQLUnitOfWorkListener(IUnitOfWorkManager unitOfWorkManager)
        {
            _unitOfWorkManager = unitOfWorkManager;
        }

        public async Task AfterExecutionAsync(IExecutionContext context)
        {
            await _unitOfWorkCompleteHandle?.CompleteAsync();
        }

        public Task AfterValidationAsync(IExecutionContext context, IValidationResult validationResult)
        {
            return Task.CompletedTask;
        }

        public Task BeforeExecutionAsync(IExecutionContext context)
        {
            _unitOfWorkCompleteHandle?.Dispose();
            _unitOfWorkCompleteHandle = UnitOfWorkManager.Begin();

            return Task.CompletedTask;
        }

        public void Dispose()
        {
            if (_disposed)
                return;

            _disposed = true;
            _unitOfWorkCompleteHandle?.Dispose();
        }

        private void ThrowIfDisposed()
        {
            if (_disposed)
            {
                throw new ObjectDisposedException(GetType().FullName);
            }
        }
    }
}
