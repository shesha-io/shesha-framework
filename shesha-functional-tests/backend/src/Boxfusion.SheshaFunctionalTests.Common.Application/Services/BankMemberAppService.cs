using Abp.Domain.Repositories;
using Boxfusion.SheshaFunctionalTests.Common.Application.Services.Dto;
using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain;
using Shesha;
using Shesha.DynamicEntities.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services
{
    public class BankMemberAppService: SheshaAppServiceBase
    {
        private readonly IRepository<Bank, Guid> _bankRepo;

        public BankMemberAppService(IRepository<Bank, Guid> bankRepo)
        {
            _bankRepo = bankRepo;
        }

        public async Task<DynamicDto<Bank, Guid>> CreateBankWithMembersAsync (BankMemberDto input)
        {
            var bank = ObjectMapper.Map<Bank>(input);
            var bankEntity = await _bankRepo.InsertAsync(bank);

            input.Members.ForEach(async member =>
            {
                await SaveOrUpdateEntityAsync<Member>(member, async item =>
                {
                    item.Bank = bankEntity;
                });
            });
            return await MapToDynamicDtoAsync<Bank, Guid>(bankEntity);
        }

    }
}
