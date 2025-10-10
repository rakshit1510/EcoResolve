import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different complaint types
const complaintIcons = {
  'Potholes': new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }),
  'Electrical Hazards': new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }),
  'Water Supply': new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }),
  'Sewage & Drainage': new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }),
  'Garbage Collection': new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }),
  'default': new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  })
};

const HeatMap = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('heatmap'); // 'heatmap' or 'list'
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [mapZoom, setMapZoom] = useState(12);
  const mapRef = useRef();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const axios = (await import('axios')).default;
      const response = await axios.get('http://localhost:8000/api/complaints/getAllComplaints', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const complaintsData = response.data.data || [];
      // Transform backend data to match component expectations
      const transformedComplaints = complaintsData.map(complaint => ({
        ...complaint,
        complaintType: complaint.department,
        // Handle both old (string location) and new (coordinate) complaints
        latitude: complaint.latitude ? parseFloat(complaint.latitude) : null,
        longitude: complaint.longitude ? parseFloat(complaint.longitude) : null,
        urgency: complaint.priority || complaint.status === 'resolved' ? 'low' : 'medium',
        createdAt: complaint.createdAt || new Date().toISOString()
      }));
      setComplaints(transformedComplaints);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
      // Fallback to localStorage for testing
      // const storedComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
      // setComplaints(storedComplaints);
      setComplaints([]);
    }
  };

  // Component to handle heatmap layer with dynamic radius based on zoom
  const HeatmapLayer = () => {
    const map = useMap();

    useEffect(() => {
      if (!map || complaints.length === 0) return;

      // Update zoom level when map zooms
      const updateZoom = () => {
        setMapZoom(map.getZoom());
      };

      map.on('zoomend', updateZoom);

      // Clear existing heat layers
      map.eachLayer((layer) => {
        if (layer.options && layer.options.radius !== undefined) {
          map.removeLayer(layer);
        }
      });

      // Filter complaints by type
      const filteredComplaints = selectedType === 'all' 
        ? complaints 
        : complaints.filter(comp => comp.complaintType === selectedType);

      if (filteredComplaints.length > 0) {
        // Prepare heatmap data - convert to [lat, lng, intensity] format
        const heatData = filteredComplaints
          .filter(comp => comp.latitude && comp.longitude)
          .map(comp => [comp.latitude, comp.longitude, 1]);

        // Dynamic radius based on zoom level
        const currentZoom = map.getZoom();
        const baseRadius = 15;
        const radius = Math.max(10, baseRadius * (18 / currentZoom)); // Radius increases as zoom decreases
        
        // Dynamic blur based on zoom
        const blur = Math.max(10, 15 * (18 / currentZoom));

        // Create heat layer using Leaflet's heat plugin
        if (window.L && window.L.heatLayer) {
          const heatLayer = window.L.heatLayer(heatData, {
            radius: radius,
            blur: blur,
            maxZoom: 18,
            minOpacity: 0.5,
            gradient: {
              0.2: 'blue',
              0.4: 'cyan',
              0.6: 'lime',
              0.7: 'yellow',
              0.8: 'orange',
              1.0: 'red'
            }
          }).addTo(map);
        } else if (L.heatLayer) {
          const heatLayer = L.heatLayer(heatData, {
            radius: radius,
            blur: blur,
            maxZoom: 18,
            minOpacity: 0.5,
            gradient: {
              0.2: 'blue',
              0.4: 'cyan',
              0.6: 'lime',
              0.7: 'yellow',
              0.8: 'orange',
              1.0: 'red'
            }
          }).addTo(map);
        }
      }

      // Cleanup function
      return () => {
        if (map) {
          map.off('zoomend', updateZoom);
          map.eachLayer((layer) => {
            if (layer.options && layer.options.radius !== undefined) {
              map.removeLayer(layer);
            }
          });
        }
      };
    }, [map, complaints, selectedType]);

    return null;
  };

  // Component to handle markers
  const ComplaintMarkers = () => {
    const map = useMap();

    const filteredComplaints = selectedType === 'all' 
      ? complaints 
      : complaints.filter(comp => comp.complaintType === selectedType);

    const navigateToComplaint = (complaint) => {
      if (complaint.latitude && complaint.longitude) {
        map.setView([complaint.latitude, complaint.longitude], 16);
        setSelectedComplaint(complaint);
      }
    };

    return (
      <>
        {filteredComplaints
          .filter(comp => comp.latitude && comp.longitude)
          .map((complaint, index) => (
            <Marker
              key={index}
              position={[complaint.latitude, complaint.longitude]}
              icon={complaintIcons[complaint.complaintType] || complaintIcons.default}
              eventHandlers={{
                click: () => navigateToComplaint(complaint),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg">{complaint.complaintType}</h3>
                  <p className="text-sm text-gray-600">{complaint.description}</p>
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      complaint.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                      complaint.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                      complaint.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {complaint.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => navigateToComplaint(complaint)}
                    className="mt-2 w-full bg-blue-500 text-white py-1 px-2 rounded text-sm hover:bg-blue-600"
                  >
                    Focus on Map
                  </button>
                </div>
              </Popup>
            </Marker>
          ))
        }
      </>
    );
  };

  // Navigate to a specific complaint
  const navigateToComplaint = (complaint) => {
    if (mapRef.current && complaint.latitude && complaint.longitude) {
      mapRef.current.setView([complaint.latitude, complaint.longitude], 16);
      setSelectedComplaint(complaint);
      setViewMode('heatmap');
    }
  };

  // Get all unique complaint types
  const complaintTypes = ['all', ...new Set(complaints.map(comp => comp.complaintType).filter(Boolean))];

  const getComplaintStats = () => {
    const stats = {};
    complaints.forEach(comp => {
      stats[comp.complaintType] = (stats[comp.complaintType] || 0) + 1;
    });
    return stats;
  };

  const stats = getComplaintStats();

  // Filter complaints for list view
  const filteredComplaints = selectedType === 'all' 
    ? complaints 
    : complaints.filter(comp => comp.complaintType === selectedType);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Complaint Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Visualize and navigate through city complaints
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Complaint Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {complaintTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View Mode
              </label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="heatmap">Heat Map</option>
                <option value="list">Complaint List</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-2">Complaint Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {complaints.filter(comp => comp.latitude && comp.longitude).length}
                  </p>
                  <p className="text-sm text-gray-600">Total Complaints</p>
                </div>
                {Object.entries(stats).slice(0, 3).map(([type, count]) => (
                  <div key={type} className="bg-green-50 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{count}</p>
                    <p className="text-sm text-gray-600 truncate" title={type}>
                      {type.length > 12 ? `${type.substring(0, 12)}...` : type}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Heat Map or List */}
        {viewMode === 'heatmap' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Map */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="h-96 rounded-md overflow-hidden">
                  <MapContainer
                    center={[26.8467, 80.9462]}
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                    whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />
                    <HeatmapLayer />
                    <ComplaintMarkers />
                  </MapContainer>
                </div>
                
                {/* Zoom-based info */}
                <div className="mt-3 text-sm text-gray-600">
                  <p>
                    <strong>Current Zoom:</strong> {mapZoom}x | 
                    <strong> Heat Radius:</strong> Adaptive (larger when zoomed out)
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Complaint List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4 h-96 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Recent Complaints</h3>
                {filteredComplaints
                  .filter(comp => comp.latitude && comp.longitude)
                  .slice(0, 10)
                  .map((complaint, index) => (
                    <div
                      key={index}
                      className={`p-3 mb-2 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedComplaint?.id === complaint.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => navigateToComplaint(complaint)}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{complaint.complaintType}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          complaint.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                          complaint.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                          complaint.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {complaint.urgency}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {complaint.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                {filteredComplaints.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No complaints found
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Complaint List View */
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Complaint List ({filteredComplaints.length})</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Type</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Severity</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Department</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((complaint, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{complaint.complaintType}</td>
                      <td className="px-4 py-3 text-sm max-w-xs truncate" title={complaint.description}>
                        {complaint.description}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-block px-2 py-1 text-xs rounded ${
                          complaint.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                          complaint.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                          complaint.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {complaint.urgency}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{complaint.department || 'Not assigned'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => navigateToComplaint(complaint)}
                          disabled={!complaint.latitude}
                          className={`px-3 py-1 text-xs rounded ${
                            complaint.latitude 
                              ? 'bg-blue-500 text-white hover:bg-blue-600' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          View on Map
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredComplaints.length === 0 && (
                <p className="text-center text-gray-500 py-8">No complaints found</p>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Heat Map Legend</h3>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-500 rounded"></div>
              <span className="ml-2 text-sm">Low Density</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-cyan-500 rounded"></div>
              <span className="ml-2 text-sm">Medium-Low</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-lime-500 rounded"></div>
              <span className="ml-2 text-sm">Medium</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-yellow-500 rounded"></div>
              <span className="ml-2 text-sm">High</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-orange-500 rounded"></div>
              <span className="ml-2 text-sm">Very High</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-red-500 rounded"></div>
              <span className="ml-2 text-sm">Critical</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Note:</strong> Heat radius automatically adjusts based on zoom level for better visibility.</p>
            <p><strong>Auto-navigation:</strong> Click on any complaint in the list or map marker to automatically navigate to its location.</p>
          </div>
        </div>

        {/* Sample Data Notice */}
        {complaints.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-6">
            <p className="text-yellow-800">
              <strong>No complaints found.</strong> Register some complaints first to see the heatmap visualization.
            </p>
          </div>
        )}
        
        {/* Coordinate Notice */}
        {complaints.length > 0 && complaints.filter(c => c.latitude && c.longitude).length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-6">
            <p className="text-blue-800">
              <strong>No location coordinates found.</strong> Complaints exist but don't have GPS coordinates for mapping. Use the new complaint form with location picker to add coordinates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeatMap;