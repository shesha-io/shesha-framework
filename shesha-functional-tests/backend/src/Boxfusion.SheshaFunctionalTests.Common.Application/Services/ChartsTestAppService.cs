using Shesha;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services
{
    public class ChartsTestAppService: SheshaAppServiceBase
    {        
        public ChartsTestAppService() { }

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
    }
}
