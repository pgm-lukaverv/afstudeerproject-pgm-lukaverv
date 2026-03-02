export const useLicenseData = () => {
  const getLicenseLabel = (license: string) => {
    const labels: Record<string, string> = {
      basic: "BASIC LICENSE",
      premium: "PREMIUM LICENSE",
      exclusive: "EXCLUSIVE LICENSE",
    };
    return labels[license] || "";
  };

  const getUsageTerms = (license: string) => {
    const terms: Record<string, any> = {
      basic: {
        streams: "Max 100,000",
        monetization: "Monetization allowed",
        exclusive: false,
        exclusiveText: "Non-Exclusive rights",
        exclusiveSubtext: "Beat remains publicly available",
      },
      premium: {
        streams: "Max 500,000",
        monetization: "Monetization allowed",
        exclusive: false,
        exclusiveText: "Non-Exclusive rights",
        exclusiveSubtext: "Beat remains publicly available",
      },
      exclusive: {
        streams: "Unlimited",
        monetization: "Full monetization",
        exclusive: true,
        exclusiveText: "Exclusive rights",
        exclusiveSubtext: "Beat removed from store",
      },
    };

    return (
      terms[license] || {
        streams: "",
        monetization: "",
        exclusive: false,
        exclusiveText: "",
        exclusiveSubtext: "",
      }
    );
  };

  return {
    getLicenseLabel,
    getUsageTerms,
  };
};
