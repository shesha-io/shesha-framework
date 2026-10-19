namespace Shesha
{
    public interface IDynamicCrudAppService
    {
        /// <summary>
        /// If true, enabled/disabled check on entity type is skipped
        /// </summary>
        bool SkipEnabledCheck { get; set; }
    }
    public interface IDynamicCrudAppService<TEntity, TDynamicDto, TPrimaryKey> : IDynamicCrudAppService
    {

    }
}