import { useState, useEffect } from 'react';

/**
 * Fetches public integration data for a given org and integration type.
 *
 * @param {string} orgId - The organization ID
 * @param {string} integrationType - The type of integration (e.g. "calendlyIntegration", "twilioIntegration")
 * @returns {{
 *   integration: any,
 *   loading: boolean,
 *   error: string | null,
 *   setIntegration: Function
 * }}
 */
export const usePublicIntegration = (orgId, integrationType) => {
  const [integration, setIntegration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIntegration = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/org/${orgId}/integrations/public?type=${integrationType}`
        );

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        const data = await response.json();
        setIntegration(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orgId && integrationType) {
      fetchIntegration();
    }
  }, [orgId, integrationType]);

  return { integration, loading, error, setIntegration };
};
