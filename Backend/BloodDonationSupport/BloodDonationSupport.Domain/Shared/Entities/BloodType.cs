using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Shared.Entities
{
    public class BloodType
    {
        public int Id { get; private set; }
        public string Abo { get; private set; } = string.Empty; // A, B, O, AB
        public string Rh { get; private set; } = string.Empty;  // + hoặc -

        private BloodType() { } // EF Core cần
        public BloodType(string abo, string rh)
        {
            Abo = abo;
            Rh = rh;
        }

        public override string ToString() => $"{Abo}{Rh}";
    }
}
