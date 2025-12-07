import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyMatches, acceptMatch, declineMatch } from "../../services/matchService";
import { getRequestById } from "../../services/requestService";

export default function MyMatches() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingMatch, setProcessingMatch] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getMyMatches();
        if (response.success && response.data) {
          setMatches(Array.isArray(response.data) ? response.data : []);
        } else {
          setMatches([]);
        }
      } catch (err) {
        console.error("Error fetching matches:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load matches"
        );
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // Handle accept match
  const handleAcceptMatch = async (matchId) => {
    if (!window.confirm("Accept this match? This will confirm your availability for this blood donation request.")) {
      return;
    }

    setProcessingMatch(matchId);
    try {
      const response = await acceptMatch(matchId);

      if (response.success) {
        alert("Match accepted successfully!");
        // Reload matches
        const matchesResponse = await getMyMatches();
        if (matchesResponse.success && matchesResponse.data) {
          setMatches(Array.isArray(matchesResponse.data) ? matchesResponse.data : []);
        }
      } else {
        alert(response.message || "Failed to accept match");
      }
    } catch (err) {
      console.error("Error accepting match:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to accept match. Please try again."
      );
    } finally {
      setProcessingMatch(null);
    }
  };

  // Handle decline match
  const handleDeclineMatch = async (matchId) => {
    if (!window.confirm("Decline this match? This will indicate that you are not available for this blood donation request.")) {
      return;
    }

    setProcessingMatch(matchId);
    try {
      const response = await declineMatch(matchId);

      if (response.success) {
        alert("Match declined successfully!");
        // Reload matches
        const matchesResponse = await getMyMatches();
        if (matchesResponse.success && matchesResponse.data) {
          setMatches(Array.isArray(matchesResponse.data) ? matchesResponse.data : []);
        }
      } else {
        alert(response.message || "Failed to decline match");
      }
    } catch (err) {
      console.error("Error declining match:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to decline match. Please try again."
      );
    } finally {
      setProcessingMatch(null);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const statusColors = {
      ACCEPTED: "bg-green-100 text-green-800 border-green-300",
      PROPOSED: "bg-yellow-100 text-yellow-800 border-yellow-300",
      REJECTED: "bg-red-100 text-red-800 border-red-300",
      DECLINED: "bg-red-100 text-red-800 border-red-300",
      CONTACTED: "bg-blue-100 text-blue-800 border-blue-300",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-600 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/20 to-transparent"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">My Matches</h1>
          <p className="text-red-50 text-lg">
            View and manage your blood donation matches
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Loading matches...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100 text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-red-600 text-lg font-semibold mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100 text-center">
          <svg
            className="w-24 h-24 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Matches Found
          </h2>
          <p className="text-gray-600 text-lg">
            You don't have any matches yet. Matches will appear here when staff matches you with blood donation requests.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <div
              key={match.matchId}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Match #{match.matchId}
                    </h3>
                    <Link
                      to={`/dashboard/requests/${match.requestId}`}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline mt-1 block"
                    >
                      Request #{match.requestId}
                    </Link>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                      match.status
                    )}`}
                  >
                    {match.status}
                  </span>
                </div>

                {/* Match Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Donor ID:</span>
                    <span className="font-semibold text-gray-900">{match.donorId}</span>
                  </div>
                  {match.distanceKm != null && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Distance:</span>
                      <span className="font-semibold text-gray-900">
                        {match.distanceKm.toFixed(2)} km
                      </span>
                    </div>
                  )}
                  {match.compatibilityScore != null && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Compatibility:</span>
                      <span className="font-semibold text-gray-900">
                        {match.compatibilityScore.toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {match.contactedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Contacted:</span>
                      <span className="font-semibold text-gray-900">
                        {formatDate(match.contactedAt)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="font-semibold text-gray-900">
                      {formatDate(match.createdAt)}
                    </span>
                  </div>
                  {match.response && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Response:</span>
                      <span className={`font-semibold ${
                        match.response === "ACCEPT" ? "text-green-600" : "text-red-600"
                      }`}>
                        {match.response}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons - Only show for PROPOSED status */}
                {match.status === "PROPOSED" && (
                  <div className="pt-4 border-t border-gray-200 flex gap-3">
                    <button
                      onClick={() => handleAcceptMatch(match.matchId)}
                      disabled={processingMatch === match.matchId}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {processingMatch === match.matchId ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Accept
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeclineMatch(match.matchId)}
                      disabled={processingMatch === match.matchId}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {processingMatch === match.matchId ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Decline
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Status message for accepted/declined matches */}
                {(match.status === "ACCEPTED" || match.status === "DECLINED" || match.response) && (
                  <div className={`pt-4 border-t border-gray-200 text-center text-sm font-medium ${
                    match.status === "ACCEPTED" || match.response === "ACCEPT" 
                      ? "text-green-600" 
                      : "text-red-600"
                  }`}>
                    {match.status === "ACCEPTED" || match.response === "ACCEPT"
                      ? "✓ You have accepted this match"
                      : "✗ You have declined this match"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

