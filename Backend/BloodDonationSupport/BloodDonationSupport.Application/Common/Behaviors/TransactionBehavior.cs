using BloodDonationSupport.Application.Common.Interfaces;
using MediatR;

namespace BloodDonationSupport.Application.Common.Behaviors
{
    public class TransactionBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : notnull
    {
        private readonly IUnitOfWork _unitOfWork;

        public TransactionBehavior(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            if (request is not ITransactionalRequest)
                return await next();

            await _unitOfWork.BeginTransactionAsync();

            try
            {
                var response = await next();
                await _unitOfWork.CommitTransactionAsync();
                return response;
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }
    }
}