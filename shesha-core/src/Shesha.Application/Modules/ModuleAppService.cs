using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Abp.Runtime.Validation;
using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;
using Shesha.GraphQL.Mvc;
using System;
using System.Threading.Tasks;

namespace Shesha.Modules
{
    public class ModuleAppService : DynamicCrudAppService<Module, DynamicDto<Module, Guid>, Guid>
    {
        public ModuleAppService(IRepository<Module, Guid> repository) : base(repository)
        {
        }

        [Obsolete]
        public override Task<DynamicDto<Module, Guid>> CreateAsync(DynamicDto<Module, Guid> input)
        {
            throw new AbpValidationException("Manual creation of the modules is not allowed");
        }

        [Obsolete]
        public override Task<GraphQLDataResult<Module>> CreateGqlAsync(string properties, DynamicDto<Module, Guid> input)
        {
            throw new AbpValidationException("Manual creation of the modules is not allowed");
        }

        [Obsolete]
        public override Task<DynamicDto<Module, Guid>> UpdateAsync(DynamicDto<Module, Guid> input)
        {
            throw new AbpValidationException("Manual update of the modules is not allowed");
        }

        [Obsolete]
        public override Task<GraphQLDataResult<Module>> UpdateGqlAsync(string properties, DynamicDto<Module, Guid> input)
        {
            throw new AbpValidationException("Manual update of the modules is not allowed");
        }


        [Obsolete]
        public override Task DeleteAsync(EntityDto<Guid> input)
        {
            throw new AbpValidationException("Manual deletion of the modules is not allowed");
        }
    }
}
