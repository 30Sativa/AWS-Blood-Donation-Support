using BloodDonationSupport.Application.Common.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Common.Behaviors
{
    public class TransactionBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
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
