using Abp.Domain.Repositories;
using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain;
using Shesha;
using Shesha.Application.Services.Dto;
using Shesha.Extensions;
using Shesha.Utilities;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services
{
    public class DynamicColumnsTest : SheshaAppServiceBase
    {
        private readonly IRepository<Member, Guid> _memberRepo;

        public DynamicColumnsTest(IRepository<Member, Guid> memberRepo, IRepository<MembershipPayment, Guid> membershipPaymentRepo)
        {
            _memberRepo = memberRepo;
        }

        public class PersonSelect
        {
            public Guid Id { get; set; }
            public string Name { get; set; }
        }

        public async Task<List<PersonSelect>> GetPersonList()
        {
            return await _memberRepo.GetAll().Take(5).Select(x => new PersonSelect { Id = x.Id, Name = x.FirstName }).ToListAsync();
        }

        public async Task<Dictionary<string, object>> GetPersonDetails(PropsFilteredPagedAndSortedResultRequestDto input)
        {
            var columns = input.Properties?.Replace(',', ' ').Split(' ') ?? [];

            /*
            var data = new Dictionary<string, object>();
            var list = new List<Dictionary<string, object>>();
            var personFulNames = new Dictionary<string, object>();
            foreach (var column in columns.Where(x => x.Trim() != "id"))
            {
                var person = await _memberRepo.GetAsync(column.Replace("id", "").ToGuid());
                personFulNames.Add(column.ToLower(), person.FullName);
            }
            list.Add(personFulNames);

            var rnd = new Random();
            var personAmounts = new Dictionary<string, object>();
            foreach (var column in columns.Where(x => x.Trim() != "id"))
            {
                var person = await _memberRepo.GetAsync(column.Replace("id", "").ToGuid());
                personAmounts.Add(column.ToLower(), rnd.NextInt64(1000));
            }
            list.Add(personAmounts);

            data.Add("total", list.Count);
            data.Add("items", list);
            return data;
            */

            var data = new Dictionary<string, object>();
            var list = new List<Dictionary<string, object>>();
            var rnd = new Random();
            foreach (var i in Enumerable.Range(0, 5))
            {
                var personAmounts = new Dictionary<string, object>();
                foreach (var column in columns.Where(x => x.Trim() != "id"))
                {
                    var person = await _memberRepo.GetAsync(column.Replace("id", "").ToGuid());
                    personAmounts.Add(column.ToLower(), rnd.NextInt64(1000));
                }
                list.Add(personAmounts);
            }

            data.Add("total", list.Count);
            data.Add("items", list);
            return data;

        }
    }
}
