import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getAllMatches, getMatchesByRequestId, markMatchAsContacted } from "../../services/matchService";
import { getRequestById } from "../../services/requestService";

export default function ManageMatches() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestId = searchParams.get("requestId");
  
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingContacted, setMarkingContacted] = useState(null);
  const [requestInfo, setRequestInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // If requestId is provided, fetch matches for that request and request info
        if (requestId) {
          const [matchesResponse, requestResponse] = await Promise.all([
            getMatchesByRequestId(requestId),
            getRequestById(requestId),
          ]);

          if (matchesResponse.success && matchesResponse.data) {
            setMatches(Array.isArray(matchesResponse.data) ? matchesResponse.data : []);
          } else {
            setMatches([]);
          }

          if (requestResponse.success && requestResponse.data) {
            setRequestInfo(requestResponse.data);
          }
        } else {
          // Otherwise, fetch all matches
          const response = await getAllMatches();
          if (response.success && response.data) {
            setMatches(Array.isArray(response.data) ? response.data : []);
          } else {
            setMatches([]);
          }
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

    fetchData();
  }, [requestId]);

  // Handle mark as contacted
  const handleMarkAsContacted = async (matchId) => {
    if (!window.confirm("Mark this match as contacted?")) {
      return;
    }

    setMarkingContacted(matchId);
    try {
      const response = await markMatchAsContacted(matchId);

      if (response.success) {
        alert("Match marked as contacted successfully!");
        // Reload matches
        if (requestId) {
          const matchesResponse = await getMatchesByRequestId(requestId);
          if (matchesResponse.success && matchesResponse.data) {
            setMatches(Array.isArray(matchesResponse.data) ? matchesResponse.data : []);
          }
        } else {
          const matchesResponse = await getAllMatches();
          if (matchesResponse.success && matchesResponse.data) {
            setMatches(Array.isArray(matchesResponse.data) ? matchesResponse.data : []);
          }
        }
      } else {
        alert(response.message || "Failed to mark match as contacted");
      }
    } catch (err) {
      console.error("Error marking match as contacted:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to mark match as contacted. Please try again."
      );
    } finally {
      setMarkingContacted(null);
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
          <div className="flex items-center justify-between mb-4">
            {requestId && (
              <button
                onClick={() => navigate("/dashboard/staff/requests")}
                className="flex items-center gap-2 text-red-50 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Requests
              </button>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">Manage Matches</h1>
          <p className="text-red-50 text-lg">
            {requestId
              ? `Matches for Request #${requestId}`
              : "View and manage all blood donation matches"}
          </p>
          {requestInfo && (
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                Status: {requestInfo.status}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                Urgency: {requestInfo.urgency}
              </span>
            </div>
          )}
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Matches Found
          </h2>
          <p className="text-gray-600 text-lg">
            {requestId
              ? "There are no matches for this request yet."
              : "There are no matches in the system yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gradient-to-r from-red-50 via-red-50 to-red-100 border-b-2 border-red-200">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Match ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Donor ID
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Compatibility
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Contacted At
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {matches.map((match) => (
                  <tr
                    key={match.matchId}
                    className="group hover:bg-red-50/50 transition-all duration-200"
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-bold text-gray-900">
                        #{match.matchId}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/dashboard/staff/requests?requestId=${match.requestId}`)}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        #{match.requestId}
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {match.donorId}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${getStatusColor(
                          match.status
                        )}`}
                      >
                        {match.status || "PROPOSED"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-900 font-medium">
                        {match.compatibilityScore != null
                          ? `${match.compatibilityScore.toFixed(1)}%`
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-900 font-medium">
                        {match.distanceKm != null
                          ? `${match.distanceKm.toFixed(2)} km`
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-900">
                        {match.contactedAt ? formatDate(match.contactedAt) : "Not contacted"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-900">
                        {formatDate(match.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      {!match.contactedAt && (
                        <button
                          onClick={() => handleMarkAsContacted(match.matchId)}
                          disabled={markingContacted === match.matchId}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                        >
                          {markingContacted === match.matchId ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Marking...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Mark as Contacted
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Stats */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium text-sm">Total Matches:</span>
                <span className="font-bold text-gray-900 text-base">{matches.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

