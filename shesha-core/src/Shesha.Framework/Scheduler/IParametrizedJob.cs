using System.Threading.Tasks;

namespace Shesha.Scheduler
{
    /// <summary>
    /// Parametrized job
    /// </summary>
    /// <typeparam name="TParams"></typeparam>
    public interface IParametrizedJob<TParams>: IParametrizedJob where TParams : class, new()
    {
        /// <summary>
        /// Job parameters
        /// </summary>
        TParams JobParameters { get; }
    }

    public interface IParametrizedJob 
    { 
        /// <summary>
        /// Read parameters from Json
        /// </summary>
        /// <returns></returns>
        Task ReadParametersJsonAsync(string json);
    }
}
