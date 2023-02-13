using Abp.Domain.Uow;
using GraphQL.Execution;
using GraphQL.Validation;
using System.Threading.Tasks;

namespace Shesha.Web.Host.Startup
{
    public class GraphQLNhListener : IDocumentExecutionListener
    {
        private IUnitOfWorkCompleteHandle _unitOfWorkCompleteHandle;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public GraphQLNhListener(IUnitOfWorkManager unitOfWorkManager)
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
            _unitOfWorkCompleteHandle = _unitOfWorkManager.Begin();

            return Task.CompletedTask;
        }
    }
}
