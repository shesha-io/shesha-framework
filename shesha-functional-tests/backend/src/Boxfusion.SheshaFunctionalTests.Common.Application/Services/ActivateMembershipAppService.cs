using Abp.Domain.Repositories;
using Abp.UI;
using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain;
using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain.Enum;
using Microsoft.AspNetCore.Mvc;
using Shesha;
using Shesha.DynamicEntities.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services
{
    public class ActivateMembershipAppService : SheshaAppServiceBase
    {
        private readonly IRepository<Member, Guid> _memberRepo;
        private readonly IRepository<MembershipPayment, Guid> _membershipPaymentRepo;

        public ActivateMembershipAppService(IRepository<Member, Guid> memberRepo, IRepository<MembershipPayment, Guid> membershipPaymentRepo)
        {
            _memberRepo = memberRepo;
            _membershipPaymentRepo = membershipPaymentRepo;
        }

        [HttpPut, Route("[action]/{memberId}")]
        public async Task<DynamicDto<Member, Guid>> ActivateMembership(Guid memberId)
        {
            var member = await _memberRepo.GetAsync(memberId);
            var payments = await _membershipPaymentRepo.GetAllListAsync(data => data.Member.Id == memberId);

            if (payments.Count == 0) throw new UserFriendlyException("There no payments made");

            double totalAmount = 0;
            payments.ForEach(a =>
            {
                totalAmount += a.Amount;
            });

            if (totalAmount < 100) throw new UserFriendlyException("Payments made are less than 100");


            member.MembershipStatus = RefListMembershipStatuses.Active;
            var updatedMember = await _memberRepo.UpdateAsync(member);

            return await MapToDynamicDtoAsync<Member, Guid>(updatedMember);
        }
    }
}
