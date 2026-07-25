import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaUser, FaMap, FaTractor, FaShieldAlt, FaHistory, FaChevronLeft, 
  FaCheckCircle, FaBan, FaCalendarAlt, FaEnvelope, FaMobileAlt, FaBuilding,
  FaFileContract, FaCreditCard, FaMapMarkerAlt, FaExchangeAlt, FaClock
} from 'react-icons/fa';
import api from '../utils/api';
import { PATHS } from '../constants';
import { useToast } from '../context/ToastContext';

export const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'billing', 'vehicles', 'documents', 'timeline'
  const [timeline, setTimeline] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomerProfile = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/customers/${id}`);
      if (response.data && response.data.success) {
        setData(response.data.data);
        // Pre-select first device for timeline tab if any
        if (response.data.data.devices?.length > 0) {
          setSelectedDeviceId(response.data.data.devices[0]._id);
        }
      }
    } catch (error) {
      console.error('Failed to load customer profile:', error);
      toast.error('Failed to retrieve customer details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerProfile();
  }, [id]);

  // Load device timeline when selected device changes
  useEffect(() => {
    if (!selectedDeviceId) return;
    const fetchTimeline = async () => {
      try {
        const response = await api.get(`/devices/${selectedDeviceId}/timeline`);
        if (response.data && response.data.success) {
          setTimeline(response.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTimeline();
  }, [selectedDeviceId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-40 bg-gray-250 dark:bg-emerald-950/15 rounded animate-pulse" />
        <div className="h-44 bg-gray-200 dark:bg-emerald-950/10 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-250 dark:bg-emerald-950/5 rounded-3xl animate-pulse md:col-span-2" />
          <div className="h-64 bg-gray-250 dark:bg-emerald-950/5 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data || !data.customer) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold dark:text-white">Customer Account Not Found</h2>
        <button onClick={() => navigate(PATHS.CUSTOMER_MANAGEMENT)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl cursor-pointer">
          Back to List
        </button>
      </div>
    );
  }

  const { customer, vehicles, devices } = data;

  const renderStatusBadge = (status) => {
    const isActive = status === 'Active' || status === 'Online' || status === 'Working';
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
        isActive 
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/45 dark:text-emerald-450 border border-emerald-250 dark:border-emerald-900/35'
          : 'bg-red-50 text-red-750 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30'
      }`}>
        <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
        {status || 'Active'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Back Action */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(PATHS.CUSTOMER_MANAGEMENT)}
          className="p-2.5 bg-white dark:bg-emerald-950/20 border border-gray-200 dark:border-emerald-900/30 rounded-xl text-xs hover:bg-gray-100 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
        >
          <FaChevronLeft />
        </button>
        <div>
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Client Management</span>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            {customer.name}
            {renderStatusBadge(customer.subscriptionStatus || 'Active')}
          </h1>
        </div>
      </div>

      {/* Profile Overview Banner */}
      <div className="p-6 bg-white dark:bg-[#0e1712] border border-gray-150 dark:border-emerald-950/20 rounded-3xl shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 text-xs">
          <div>
            <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Company Account</span>
            <div className="flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-250">
              <FaBuilding className="text-emerald-500 shrink-0" />
              {customer.company || 'Private Farm'}
            </div>
          </div>
          <div>
            <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Mobile Details</span>
            <div className="flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-250">
              <FaMobileAlt className="text-emerald-500 shrink-0" />
              {customer.phone}
            </div>
          </div>
          <div>
            <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Registered Email</span>
            <div className="flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-250">
              <FaEnvelope className="text-emerald-500 shrink-0" />
              {customer.email || 'No email registered'}
            </div>
          </div>
          <div>
            <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Subscription Plan</span>
            <span className="px-2 py-0.5 rounded font-black uppercase text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {customer.planName || 'Standard'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-emerald-950/20 pb-1 overflow-x-auto custom-scrollbar text-xs font-bold">
        {[
          { id: 'profile', label: 'Client Profile', icon: FaUser },
          { id: 'billing', label: 'Billing & Subscriptions', icon: FaCreditCard },
          { id: 'vehicles', label: 'Vehicles & Trackers', icon: FaTractor },
          { id: 'documents', label: 'Document Hub', icon: FaFileContract },
          { id: 'timeline', label: 'Live Device Timeline', icon: FaClock }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 relative shrink-0 cursor-pointer transition-all ${
                activeTab === tab.id 
                  ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Icon /> {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 dark:bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white dark:bg-[#0e1712] border border-gray-150 dark:border-emerald-950/20 rounded-3xl p-6 shadow-sm min-h-[300px]">
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-emerald-600 uppercase tracking-wider">Registered Demographic Details</h3>
              <div className="space-y-3 bg-gray-50 dark:bg-[#121c17] p-4 border border-gray-100 dark:border-emerald-950/30 rounded-2xl">
                {customer.location ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 font-bold block uppercase text-[10px]">State</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{customer.location.stateName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold block uppercase text-[10px]">District</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{customer.location.districtName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold block uppercase text-[10px]">Mandal / Block</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{customer.location.mandalName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold block uppercase text-[10px]">Village</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{customer.location.villageName}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400 font-bold block uppercase text-[10px]">Street Address</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{customer.location.addressLine || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold block uppercase text-[10px]">Pincode</span>
                      <span className="font-mono text-gray-800 dark:text-gray-200">{customer.location.pincode}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 py-4 text-center">No location hierarchy mapped for this profile.</p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-black text-emerald-600 uppercase tracking-wider">Identity Details</h3>
              <div className="space-y-3 bg-gray-50 dark:bg-[#121c17] p-4 border border-gray-100 dark:border-emerald-950/30 rounded-2xl">
                <div className="flex justify-between border-b border-gray-100 dark:border-emerald-950/10 pb-2">
                  <span className="text-gray-450 font-bold uppercase tracking-wider text-[10px]">Aadhaar (UIDAI)</span>
                  <span className="font-mono font-bold dark:text-white">{customer.aadhaarNumber || 'Not Configured'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-emerald-950/10 pb-2">
                  <span className="text-gray-450 font-bold uppercase tracking-wider text-[10px]">GST Identification</span>
                  <span className="font-mono font-bold dark:text-white">{customer.gstNumber || 'Not Registered'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-450 font-bold uppercase tracking-wider text-[10px]">Registered Date</span>
                  <span className="font-semibold dark:text-white">{new Date(customer.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscriptions & Billing Tab */}
        {activeTab === 'billing' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-sm font-black text-emerald-600 uppercase tracking-wider">Subscription Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-[#121c17] border border-gray-100 dark:border-emerald-950/20 rounded-2xl">
                  <span className="text-gray-400 font-bold block uppercase tracking-wider text-[9px] mb-1">Plan Package</span>
                  <span className="text-base font-extrabold dark:text-white">{customer.planName || 'Standard'}</span>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-[#121c17] border border-gray-100 dark:border-emerald-950/20 rounded-2xl">
                  <span className="text-gray-400 font-bold block uppercase tracking-wider text-[9px] mb-1">Device Fleet Limits</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-450">{customer.devicesUsed || 0} / {customer.devicesAllowed || 5} Active</span>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-[#121c17] border border-gray-100 dark:border-emerald-950/20 rounded-2xl">
                  <span className="text-gray-400 font-bold block uppercase tracking-wider text-[9px] mb-1">Contract Validity</span>
                  <span className="text-base font-extrabold dark:text-white">Expires: {customer.planExpiryDate ? new Date(customer.planExpiryDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-[#121c17] border border-gray-100 dark:border-emerald-950/20 rounded-2xl">
                  <span className="text-gray-400 font-bold block uppercase tracking-wider text-[9px] mb-1">Billing status</span>
                  <span className="px-2 py-0.5 font-bold uppercase rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20">{customer.paymentStatus || 'Paid'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-emerald-600 uppercase tracking-wider">Service Support</h3>
              <div className="bg-gray-50 dark:bg-[#121c17] border border-gray-100 dark:border-emerald-950/20 rounded-2xl p-4 space-y-3">
                <p className="text-gray-500 leading-normal">This customer is registered under the {customer.planName || 'Standard'} SLA support package.</p>
                <div className="flex gap-2 font-bold pt-2">
                  <button className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-center cursor-pointer transition-all">Renew Plan</button>
                  <button className="flex-1 py-2 border border-gray-200 dark:border-emerald-900/30 text-gray-700 dark:text-gray-300 rounded-xl text-center hover:bg-gray-100 dark:hover:bg-emerald-950/30 cursor-pointer transition-all">Support Desk</button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Vehicles & GPS Devices Tab */}
        {activeTab === 'vehicles' && (
          <div className="space-y-6 text-xs">
            
            <div className="space-y-3">
              <h3 className="text-sm font-black text-emerald-600 uppercase tracking-wider">Installed Hardware Trackers ({devices?.length || 0})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {devices?.map(dev => (
                  <div key={dev._id} className="p-4 bg-gray-50 dark:bg-[#121c17] border border-gray-150 dark:border-emerald-950/20 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-extrabold text-gray-800 dark:text-white">Kit: {dev.deviceId}</span>
                        {renderStatusBadge(dev.detailedLiveStatus)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3 text-gray-400">
                        <span>IMEI: <strong className="text-gray-700 dark:text-gray-200 font-mono">{dev.imei}</strong></span>
                        <span>SIM: <strong className="text-gray-700 dark:text-gray-200 font-mono">{dev.simNumber || 'N/A'}</strong></span>
                        <span>Installer: <strong className="text-gray-700 dark:text-gray-200">{dev.installerName || 'N/A'}</strong></span>
                        <span>Install Date: <strong className="text-gray-700 dark:text-gray-200">{dev.installationDate ? new Date(dev.installationDate).toLocaleDateString() : 'N/A'}</strong></span>
                        <span>SIM ICCID: <strong className="text-gray-700 dark:text-gray-200 font-mono">{dev.simIccid || 'N/A'}</strong></span>
                        <span>SIM Carrier: <strong className="text-gray-700 dark:text-gray-200">{dev.simProvider || 'N/A'}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
                {(!devices || devices.length === 0) && (
                  <p className="text-gray-400 py-6 text-center col-span-2">No GPS devices currently assigned to this account.</p>
                )}
              </div>
            </div>

            <div className="space-y-3 border-t border-gray-100 dark:border-emerald-950/20 pt-6">
              <h3 className="text-sm font-black text-emerald-600 uppercase tracking-wider">Registered Assets ({vehicles?.length || 0})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicles?.map(veh => (
                  <div key={veh._id} className="p-4 bg-gray-50 dark:bg-[#121c17] border border-gray-150 dark:border-emerald-950/20 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-extrabold text-gray-800 dark:text-white">{veh.name} ({veh.brand} &bull; {veh.model})</span>
                        <span className="px-2 py-0.5 bg-gray-200 dark:bg-emerald-900 text-gray-700 dark:text-emerald-300 font-bold uppercase text-[9px] rounded">{veh.type}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3 text-gray-400">
                        <span>Chassis No: <strong className="text-gray-700 dark:text-gray-200 font-mono">{veh.chassisNumber}</strong></span>
                        <span>Engine No: <strong className="text-gray-700 dark:text-gray-200 font-mono">{veh.engineNumber || 'N/A'}</strong></span>
                        <span>Reg No: <strong className="text-gray-700 dark:text-gray-200 font-mono">{veh.registration}</strong></span>
                        <span>RC Owner: <strong className="text-gray-700 dark:text-gray-200">{veh.rcOwnerName || 'N/A'}</strong></span>
                        <span>Purchase: <strong className="text-gray-700 dark:text-gray-200">{veh.purchaseDate ? new Date(veh.purchaseDate).toLocaleDateString() : 'N/A'}</strong></span>
                        <span>Year: <strong className="text-gray-700 dark:text-gray-200">{veh.manufacturingYear || 'N/A'}</strong></span>
                        <span>Insurance Expiry: <strong className="text-gray-700 dark:text-gray-200">{veh.insuranceExpiry ? new Date(veh.insuranceExpiry).toLocaleDateString() : 'N/A'}</strong></span>
                        <span>Fitness Expiry: <strong className="text-gray-700 dark:text-gray-200">{veh.fitnessExpiry ? new Date(veh.fitnessExpiry).toLocaleDateString() : 'N/A'}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
                {(!vehicles || vehicles.length === 0) && (
                  <p className="text-gray-400 py-6 text-center col-span-2">No vehicles currently registered under this account.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-black text-emerald-600 uppercase tracking-wider">Verification Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {customer.documents && customer.documents.length > 0 ? (
                customer.documents.map((doc, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 dark:bg-[#121c17] border border-gray-150 dark:border-emerald-950/20 rounded-2xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-gray-800 dark:text-gray-200 block text-xs">{doc.fileName}</span>
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">{doc.documentType}</span>
                    </div>
                    <a
                      href={doc.filePath}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                      View Document File
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 py-8 text-center col-span-2">No uploaded verification documents registered on this account.</p>
              )}
            </div>
          </div>
        )}

        {/* Event Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-100 dark:border-emerald-950/15">
              <h3 className="text-sm font-black text-emerald-600 uppercase tracking-wider">GPS Device Event Log Timeline</h3>
              
              {/* Device Selector */}
              {devices?.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-bold uppercase text-[10px]">Select Device:</span>
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    className="p-1.5 bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/30 rounded-xl dark:text-white focus:outline-none font-bold"
                  >
                    {devices.map(d => <option key={d._id} value={d._id}>{d.deviceId}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="relative border-l-2 border-emerald-100 dark:border-emerald-950/30 ml-4 pl-6 space-y-6">
              {timeline.length > 0 ? (
                timeline.map((event, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-9 top-0.5 bg-white dark:bg-[#0c120f] border-2 border-emerald-500 rounded-full w-4.5 h-4.5 flex items-center justify-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </span>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-800 dark:text-gray-250 text-xs">{event.status}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">{event.details}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 py-8 text-center -ml-6 border-l-0">No timeline tracking logs recorded for this device.</p>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default CustomerProfile;
