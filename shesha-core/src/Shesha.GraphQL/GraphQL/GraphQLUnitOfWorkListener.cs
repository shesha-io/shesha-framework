using Abp.Domain.Uow;
using GraphQL.Execution;
using GraphQL.Validation;
using System.Threading.Tasks;

namespace Shesha.GraphQL.UnitOfWork
{
    public class GraphQLUnitOfWorkListener : IDocumentExecutionListener
    {
        private IUnitOfWorkCompleteHandle _unitOfWorkCompleteHandle;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

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
            _unitOfWorkCompleteHandle = UnitOfWorkManager.Begin();

            return Task.CompletedTask;
        }
    }
}
