﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Common
{
    public abstract class BaseEntity<TId> 
    {
        //Property by genaric
        public TId Id { get; protected set; }

        //Domain Events
        private List<IDomainEvent> _domainEvents = new();
        public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents?.AsReadOnly();

        public void AddDomainEvent(IDomainEvent domainEvent)
        {
            _domainEvents.Add(domainEvent);
        }


        public void ClearDomainEvents()
        {
            _domainEvents?.Clear();
        }


        //Audit

        public DateTime CreatedOn { get; protected set; } = DateTime.UtcNow;
        public DateTime? UpdateAt { get; protected set; }

        public void MarkUpdated()
        {
            UpdateAt = DateTime.UtcNow;
        }
    }
}
