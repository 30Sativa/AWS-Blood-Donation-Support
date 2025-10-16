using System;
using System.Collections.Generic;

namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class LambdaExecution
{
    public string ExecutionId { get; set; } = null!;

    public string FunctionName { get; set; } = null!;

    public string Status { get; set; } = null!;

    public int? ItemsProcessed { get; set; }

    public DateTime StartedAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public string? ErrorMessage { get; set; }
}
