// ==========================================================================
// PROJECTPULSE — Centralized Formatting & Mathematical Helper Functions
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD
// ==========================================================================

const Formatters = {
  // Formats currency in Indian Crore / Lakh Crore convention
  formatCurrencyCrore(amountCr) {
    if (amountCr === null || amountCr === undefined || isNaN(amountCr)) {
      return "₹0 Cr";
    }
    const absVal = Math.abs(amountCr);
    
    // If 1 Lakh Crore (100,000 Cr) or more
    if (absVal >= 100000) {
      const lakhCrore = (amountCr / 100000).toFixed(1);
      return `₹${Number(lakhCrore).toLocaleString('en-IN')}L Cr`;
    }

    // Standard Crores with Indian thousand separators
    const formatted = Number(amountCr.toFixed(1)).toLocaleString('en-IN');
    return `₹${formatted} Cr`;
  },

  // Formats percentage with standard 1 decimal place
  formatPercentage(value, decimals = 1) {
    if (value === null || value === undefined || isNaN(value)) {
      return "0.0%";
    }
    return `${Number(value).toFixed(decimals)}%`;
  },

  // Formats date string (e.g. "2025-12" to "Dec 2025")
  formatDate(dateStr) {
    if (!dateStr) return "N/A";
    const parts = dateStr.split("-");
    if (parts.length >= 2) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      if (monthIndex >= 0 && monthIndex < 12) {
        if (parts.length >= 3) {
          return `${parseInt(parts[2], 10)} ${monthNames[monthIndex]} ${year}`;
        }
        return `${monthNames[monthIndex]} ${year}`;
      }
    }
    return dateStr;
  },

  // Formats duration in months or years
  formatDuration(months) {
    if (!months || isNaN(months) || months <= 0) {
      return "On Schedule";
    }
    if (months >= 12) {
      const yrs = Math.floor(months / 12);
      const remainingMos = Math.round(months % 12);
      if (remainingMos === 0) {
        return `${yrs} yr${yrs > 1 ? 's' : ''}`;
      }
      return `${yrs} yr${yrs > 1 ? 's' : ''} ${remainingMos} mo${remainingMos > 1 ? 's' : ''}`;
    }
    return `${Number(months).toFixed(1)} months`;
  },

  // Formats risk score (e.g. "82 / 100")
  formatRiskScore(score) {
    if (score === null || score === undefined) return "--";
    return `${Math.round(score)} / 100`;
  },

  // Formats project identifier
  formatProjectId(id) {
    return id ? String(id).toUpperCase() : "PRJ-UNKNOWN";
  },

  // Calculates financial vs physical progress gap
  calculateProgressGap(financialPct, physicalPct) {
    const gap = (financialPct || 0) - (physicalPct || 0);
    return parseFloat(gap.toFixed(1));
  },

  // Centralized Risk Color and Label Mapping
  getRiskStyle(levelOrScore) {
    let level = "LOW";
    if (typeof levelOrScore === "number") {
      if (levelOrScore >= 75) level = "CRITICAL";
      else if (levelOrScore >= 50) level = "HIGH";
      else if (levelOrScore >= 25) level = "MODERATE";
      else level = "LOW";
    } else if (typeof levelOrScore === "string") {
      level = levelOrScore.toUpperCase();
    }

    switch (level) {
      case "CRITICAL":
        return {
          level: "CRITICAL",
          className: "risk-badge-critical",
          label: "Critical",
          color: "#b91c1c",
          bg: "#fef2f2",
          border: "#fecaca"
        };
      case "HIGH":
        return {
          level: "HIGH",
          className: "risk-badge-high",
          label: "High",
          color: "#c2410c",
          bg: "#fff7ed",
          border: "#fed7aa"
        };
      case "MODERATE":
        return {
          level: "MODERATE",
          className: "risk-badge-medium",
          label: "Moderate",
          color: "#b45309",
          bg: "#fffbeb",
          border: "#fde68a"
        };
      case "LOW":
      default:
        return {
          level: "LOW",
          className: "risk-badge-low",
          label: "Low",
          color: "#15803d",
          bg: "#f0fdf4",
          border: "#bbf7d0"
        };
    }
  }
};

window.Formatters = Formatters;
