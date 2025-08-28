using Abp.Domain.Repositories;
using Abp.UI;
using DocumentFormat.OpenXml.Drawing.Charts;
using Microsoft.AspNetCore.Mvc;
using Shesha;
using Shesha.Domain;
using Shesha.Domain.Enums;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services
{
    public class ChartsTestAppService: SheshaAppServiceBase
    {        
        private IRepository<OrganisationBase, Guid> organisationRepository;
        private IRepository<Person, Guid> personRepository;
        public ChartsTestAppService(IRepository<OrganisationBase, Guid> _orgs, IRepository<Person, Guid> _personRep) 
        {
            organisationRepository = _orgs;
            personRepository = _personRep;
        }

        /// <summary>
        /// Test endpoint for charts when they have to use URL to request for already prepared data
        /// </summary>
        /// <returns>Calculated Chart Data</returns>
        public object GetChartData()
        {
            return new
            {
                labels = new[] { "Boxfire", "Meta Org", "SpaceTech" },
                datasets = new[]
                {
                  new
                  {
                      label = "emailAddress (count)",
                      data = new[] { 9, 1, 1 },
                      backgroundColor = new[] { "hsla(250.84687042236328, 70.84687042236328%, 67.84687042236328%, 0.75)", "hsla(53.773223876953125, 83.77322387695312%, 70.77322387695312%, 0.75)", "hsla(227.58676147460938, 77.58676147460938%, 64.58676147460938%, 0.75)" },
                      borderColor = "white"
                  }
              }
            };
        }

        /// <summary>
        /// About the creation time for organisations. We want to know how many organisations were created in a given time period.
        /// </summary>
        /// <param name="timeChooser">day | month | year</param>
        /// <param name="limit">Data Size Limit to use to make the calculatiosns</param>
        /// <returns>Number of organisations created in the chosen time(s)</returns>
        /// <exception cref="UserFriendlyException"></exception>
        [HttpGet("org-chart-data")]
        public object GetOrganisationsChartData(
            [FromQuery] string timeChooser = "day",
            [FromQuery] int limit = 10
            )
        {
            var organisations = organisationRepository.GetAll()
             .Take(limit)
             .ToList()
             .GroupBy(o => timeChooser == "day"? o.CreationTime.Day : timeChooser == "month" ? o.CreationTime.Month : o.CreationTime.Year)
             .ToList();

            if (!organisations.Any())
            {
                throw new UserFriendlyException("No data found for the specified criteria.");
            }

            //For each group, we can get the count of organisations
            var labels = organisations.Select(o => o.Key).ToArray();
            var strLabels = labels.Select(l => l.ToString()).ToArray();
            string[] months =
            [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];
            if (timeChooser == "day")
            {
                strLabels = labels.Select(d => $"Day {d}").ToArray();
            }
            else if (timeChooser == "month")
            {
                strLabels = labels.Select(m => months[m-1]).ToArray();
            }
            else if (timeChooser == "year")
            {
                strLabels = labels.Select(y => $"{y}").ToArray();
            }
            var data = organisations.Select(o => o.Count()).ToArray();
            return new
            {
                labels = strLabels,
                datasets = new[]
                {
                    new
                    {
                        label = "creationTime (count)",
                        data,
                        backgroundColor = "hsla(250, 70%, 67%, 0.75)",
                        borderColor = "white"
                    }
                }
            };
        }
    }
}
