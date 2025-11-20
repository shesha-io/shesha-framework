using Abp.Dependency;
using Shesha.Scheduler;
using Shesha.Scheduler.Attributes;
using Shesha.Scheduler.Domain.Enums;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Authentication.JwtBearer
{
    [ScheduledJob("4A0A90DB-463B-4E3B-97B8-2A55E867E842", StartUpMode.Automatic, "0 */2 * * *" /* every 2 hours */)]
    public class BlacklistCleanupJob : ScheduledJobBase<ScheduledJobStatistic>, ITransientDependency
    {
        private readonly ITokenBlacklistService _tokenBlacklistService;
        public BlacklistCleanupJob(ITokenBlacklistService tokenBlacklistService)
        {
            _tokenBlacklistService = tokenBlacklistService;
        }

        public async override Task DoExecuteAsync(CancellationToken cancellationToken)
        {
            await _tokenBlacklistService.CleanupExpiredTokensAsync();
        }
    }
}
