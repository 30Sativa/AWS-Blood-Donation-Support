using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Roles.Entities
{
    public class RoleDomain
    {
        public int Id { get; private set; }
        public string Code { get; private set; } = string.Empty; //ADMIN, MEMBER
        public string Name { get; private set; } = string.Empty;


        public RoleDomain() { } // EF constructor
        private RoleDomain(int id, string code, string name)
        {
            Id = id;
            Code = code;
            Name = name;
        }
        public static RoleDomain Rehydrate(int id, string code, string name)
        {
            return new RoleDomain(id, code, name);
        }
    }
}
