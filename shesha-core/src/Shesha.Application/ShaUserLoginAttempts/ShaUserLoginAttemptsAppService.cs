using Abp.Domain.Repositories;
using Shesha.Domain;
using Shesha.ShaUserLoginAttempts.Dto;
using System;

namespace Shesha.ShaUserLoginAttempts
{
    public class ShaUserLoginAttemptsAppService : SheshaCrudServiceBase<ShaUserLoginAttempt, ShaUserLoginAttemptDto, Guid>, IShaUserLoginAttemptsAppService
    {
        public ShaUserLoginAttemptsAppService(IRepository<ShaUserLoginAttempt, Guid> repository) : base(repository)
        {
        }
    }
}