using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Abp.Runtime.Validation;
using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;
using Shesha.GraphQL.Mvc;
using System;
using System.Threading.Tasks;

namespace Shesha.ShaUserLoginAttempts
{
    public class ShaUserLoginAttemptsAppService : DynamicCrudAppService<ShaUserLoginAttempt, DynamicDto<ShaUserLoginAttempt, Guid>, Guid>
    {
        public ShaUserLoginAttemptsAppService(IRepository<ShaUserLoginAttempt, Guid> repository) : base(repository)
        {
        }

        [Obsolete]
        public override Task<DynamicDto<ShaUserLoginAttempt, Guid>> CreateAsync(DynamicDto<ShaUserLoginAttempt, Guid> input)
        {
            throw new AbpValidationException("Manual creation of the logon audit is not allowed");
        }

        [Obsolete]
        public override Task<GraphQLDataResult<ShaUserLoginAttempt>> CreateGqlAsync(string properties, DynamicDto<ShaUserLoginAttempt, Guid> input)
        {
            throw new AbpValidationException("Manual creation of the logon audit is not allowed");
        }

        [Obsolete]
        public override Task<DynamicDto<ShaUserLoginAttempt, Guid>> UpdateAsync(DynamicDto<ShaUserLoginAttempt, Guid> input)
        {
            throw new AbpValidationException("Manual update of the logon audit is not allowed");
        }

        [Obsolete]
        public override Task<GraphQLDataResult<ShaUserLoginAttempt>> UpdateGqlAsync(string properties, DynamicDto<ShaUserLoginAttempt, Guid> input)
        {
            throw new AbpValidationException("Manual update of the logon audit is not allowed");
        }


        [Obsolete]
        public override Task DeleteAsync(EntityDto<Guid> input)
        {
            throw new AbpValidationException("Manual deletion of the logon audit is not allowed");
        }
    }
}