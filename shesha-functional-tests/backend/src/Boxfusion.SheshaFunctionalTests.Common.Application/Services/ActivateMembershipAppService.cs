using Abp.Domain.Repositories;
using Abp.Runtime.Validation;
using Abp.UI;
using Boxfusion.SheshaFunctionalTests.Common.Application.Services.Dto;
using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain;
using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain.Enum;
using Microsoft.AspNetCore.Mvc;
using NHibernate.Linq;
using Shesha;
using Shesha.DynamicEntities.Dtos;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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
        
        /// <summary>
        /// 
        /// </summary>
        /// <param name="memberId"></param>
        /// <returns></returns>
        /// <exception cref="AbpValidationException"></exception>
        [HttpPut, Route("[action]")]
        public async Task<DynamicDto<Member, Guid>> ActivateMembership(Guid memberId)
        {
            var member = await _memberRepo.GetAsync(memberId);
            var payments = await _membershipPaymentRepo.GetAllListAsync(data => data.Member.Id == memberId);

            var errors = new List<ValidationResult>();

            if (payments.Count == 0) errors.Add(new ValidationResult("There no payments made"));

            double totalAmount = 0;
            payments.ForEach(a =>
            {
                totalAmount += a.Amount;
            });

            if (totalAmount < 100) errors.Add(new ValidationResult("Payments made are less than 100"));
            
            if (errors.Any()) throw new AbpValidationException("Erros", errors);


            member.MembershipStatus = RefListMembershipStatuses.Active;
            var updatedMember = await _memberRepo.UpdateAsync(member);

            return await MapToDynamicDtoAsync<Member, Guid>(updatedMember);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="memberId"></param>
        /// <returns></returns>
        public async Task<List<DynamicDto<MembershipPayment, Guid>>> GetMemberPayments (Guid memberId)
        {
            var memberPayments = await Task.WhenAll(_membershipPaymentRepo.GetAll().Where(data => data.Member.Id == memberId)
                                                        .ToList()
                                                        .Select(async m =>
                                                        {
                                                            var result = await MapToDynamicDtoAsync<MembershipPayment, Guid>(m);
                                                            return result;
                                                        }));
            return memberPayments.ToList();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        public async Task<List<DynamicDto<MembershipPayment, Guid>>> GetAllMembershipPayments()
        {
            var memberPayments = await Task.WhenAll(_membershipPaymentRepo.GetAll().ToList()
                                                        .Select(async m =>
                                                        {
                                                            var result = await MapToDynamicDtoAsync<MembershipPayment, Guid>(m);
                                                            return result;
                                                        }));
            return memberPayments.ToList();
        }


        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        public async Task<DynamicDto<MembershipPayment, Guid>> CreateMemberPayment(MembershipPaymentDto input)
        {
            var memberPayment = ObjectMapper.Map<MembershipPayment>(input);
            await _membershipPaymentRepo.InsertAsync(memberPayment);
            return await MapToDynamicDtoAsync<MembershipPayment, Guid>(memberPayment);
        }
    }
}