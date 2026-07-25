import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaQrcode, FaTractor, FaUser, FaMobileAlt, FaShieldAlt, 
  FaCheckCircle, FaExclamationTriangle, FaCamera, FaTimes, FaUndo,
  FaMapMarkerAlt, FaFileContract, FaClock
} from 'react-icons/fa';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

export const DeviceActivation = () => {
  const toast = useToast();

  // Form states
  const [deviceId, setDeviceId] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [vehicleType, setVehicleType] = useState('Tractor');
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [farmName, setFarmName] = useState('');

  // Metadata dropdown state options
  const [types, setTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [hpOptions, setHpOptions] = useState([]);

  // Selected brand/model/HP
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedHP, setSelectedHP] = useState('');

  // Installation & Vehicle Specific state details
  const [installerName, setInstallerName] = useState('');
  const [installationDate, setInstallationDate] = useState(new Date().toISOString().split('T')[0]);
  const [installationLocation, setInstallationLocation] = useState('');
  const [vehicleOdometer, setVehicleOdometer] = useState(0);
  const [deviceWarranty, setDeviceWarranty] = useState(new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // 2 yrs default
  const [deviceSerialNumber, setDeviceSerialNumber] = useState('');
  const [simIccid, setSimIccid] = useState('');
  const [simProvider, setSimProvider] = useState('Airtel IoT');
  
  const [engineNumber, setEngineNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [manufacturingYear, setManufacturingYear] = useState(2026);
  const [rcOwnerName, setRcOwnerName] = useState('');
  const [insuranceExpiry, setInsuranceExpiry] = useState('');
  const [fitnessExpiry, setFitnessExpiry] = useState('');
  
  // Custom Service & Engine Configs
  const [engineType, setEngineType] = useState('Factory Integrated Engine');
  const [firstServiceHours, setFirstServiceHours] = useState(50);
  const [regularServiceInterval, setRegularServiceInterval] = useState(250);
  const [lastServiceHours, setLastServiceHours] = useState(0);
  const [registrationNumber, setRegistrationNumber] = useState('');

  // Geographic dropdowns state
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);

  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [pincode, setPincode] = useState('');
  const [addressLine, setAddressLine] = useState('');

  // Simulator states
  const [isVerifying, setIsVerifying] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  // Fetch metadata options on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const metadataRes = await api.get('/machines/vehicle-metadata');
        if (metadataRes.data && metadataRes.data.success) {
          setTypes(['Tractor', 'Track Harvester', 'Combine Harvester']);
          setBrands(metadataRes.data.data.brands);
        }

        const statesRes = await api.get('/customers/locations/states');
        if (statesRes.data && statesRes.data.success) {
          setStates(statesRes.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  const handleVehicleTypeChange = (typeVal) => {
    setVehicleType(typeVal);
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedHP('');
    setModels([]);
    setHpOptions([]);
    setEngineType('Factory Integrated Engine');
  };

  // Handle cascaded vehicle metadata dropdown changes
  const handleBrandChange = (brandId) => {
    setSelectedBrand(brandId);
    setSelectedModel('');
    setSelectedHP('');
    setHpOptions([]);
    if (!brandId) {
      setModels([]);
      return;
    }
    const foundBrand = brands.find(b => b._id === brandId);
    if (foundBrand) {
      setModels(foundBrand.models.filter(m => m.vehicleType === vehicleType));
    }
  };

  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
    setSelectedHP('');
    setHpOptions([]);
    if (!modelId) return;
    const foundModel = models.find(m => m._id === modelId);
    if (foundModel) {
      setHpOptions(foundModel.hpOptions || []);
      if (vehicleType === 'Combine Harvester') {
        if (foundModel.engineConfig === 'External') {
          setEngineType('John Deere Engine');
        } else {
          setEngineType('Factory Integrated Engine');
        }
      } else {
        setEngineType('Factory Integrated Engine');
      }
    }
  };

  // Geographic selectors triggers
  const handleStateChange = async (stateId) => {
    setSelectedState(stateId);
    setSelectedDistrict('');
    setSelectedMandal('');
    setSelectedVillage('');
    setPincode('');
    setDistricts([]);
    setMandals([]);
    setVillages([]);
    if (!stateId) return;
    try {
      const res = await api.get(`/customers/locations/districts?stateId=${stateId}`);
      if (res.data && res.data.success) setDistricts(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDistrictChange = async (distId) => {
    setSelectedDistrict(distId);
    setSelectedMandal('');
    setSelectedVillage('');
    setPincode('');
    setMandals([]);
    setVillages([]);
    if (!distId) return;
    try {
      const res = await api.get(`/customers/locations/mandals?districtId=${distId}`);
      if (res.data && res.data.success) setMandals(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMandalChange = async (mandalId) => {
    setSelectedMandal(mandalId);
    setSelectedVillage('');
    setPincode('');
    setVillages([]);
    if (!mandalId) return;
    try {
      const res = await api.get(`/customers/locations/villages?mandalId=${mandalId}`);
      if (res.data && res.data.success) setVillages(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleVillageChange = (villId) => {
    const selectedVill = villages.find(v => v._id === villId);
    setSelectedVillage(villId);
    setPincode(selectedVill ? selectedVill.pincode : '');
  };

  const handleSimulateScan = () => {
    setIsScannerOpen(true);
    setScanMessage('Initializing camera stream...');
    
    // Simulate detecting a code after 1.5 seconds
    setTimeout(() => {
      setScanMessage('Verifying QR Code data matrix...');
      setTimeout(() => {
        const mockScannedId = 'dev-onb-' + Math.floor(100000 + Math.random() * 900000);
        setDeviceId(mockScannedId);
        setIsScannerOpen(false);
        toast.success(`QR Code scanned: Scanned ID ${mockScannedId}`);
      }, 1000);
    }, 1200);
  };

  const handleVerifyDevice = () => {
    if (!deviceId.trim()) {
      toast.error('Please enter a GPS Device ID to verify.');
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      toast.success(`GPS Device ${deviceId} verified successfully in registry database.`);
    }, 1000);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      toast.warning('Please verify the Device ID before activation.');
      return;
    }
    if (!chassisNumber.trim() || !displayName.trim() || !customerName.trim() || !mobileNumber.trim()) {
      toast.error('All form fields are required for GPS onboarding.');
      return;
    }

    setIsActivating(true);
    try {
      // Find Brand and Model names to store in backend Machine object
      const brandObj = brands.find(b => b._id === selectedBrand);
      const modelObj = models.find(m => m._id === selectedModel);

      const payload = {
        deviceId,
        chassisNumber,
        registration: registrationNumber || '',
        displayName,
        vehicleType,
        customerName,
        mobileNumber,
        farmName,
        
        brand: brandObj ? brandObj.name : '',
        model: modelObj ? modelObj.name : '',
        horsepower: selectedHP,

        installerName,
        installationDate,
        installationLocation,
        vehicleOdometer,
        deviceWarranty,
        deviceSerialNumber,
        simIccid,
        simProvider,

        engineNumber,
        purchaseDate,
        manufacturingYear,
        rcOwnerName,
        insuranceExpiry,
        fitnessExpiry,

        state: selectedState,
        district: selectedDistrict,
        mandal: selectedMandal,
        village: selectedVillage,
        pincode,
        addressLine,

        // Service thresholds and configuration
        firstServiceHours: firstServiceHours !== undefined ? Number(firstServiceHours) : 50,
        regularServiceInterval: regularServiceInterval !== undefined ? Number(regularServiceInterval) : 250,
        lastServiceHours: lastServiceHours !== undefined ? Number(lastServiceHours) : 0,
        engineType: engineType || 'Factory Integrated Engine'
      };

      const response = await api.post('/devices/activate', payload);
      if (response.data && response.data.success) {
        toast.success(`Device ${deviceId} has been successfully activated and linked to chassis ${chassisNumber}!`);
        handleReset();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to activate device.');
    } finally {
      setIsActivating(false);
    }
  };

  const handleReset = () => {
    setDeviceId('');
    setChassisNumber('');
    setDisplayName('');
    setVehicleType('Tractor');
    setCustomerName('');
    setMobileNumber('');
    setFarmName('');
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedHP('');
    setModels([]);
    setHpOptions([]);
    setInstallerName('');
    setInstallationLocation('');
    setVehicleOdometer(0);
    setDeviceSerialNumber('');
    setSimIccid('');
    setEngineNumber('');
    setPurchaseDate('');
    setRcOwnerName('');
    setInsuranceExpiry('');
    setFitnessExpiry('');
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedMandal('');
    setSelectedVillage('');
    setPincode('');
    setAddressLine('');
    setIsVerified(false);
    setEngineType('Factory Integrated Engine');
    setFirstServiceHours(50);
    setRegularServiceInterval(250);
    setLastServiceHours(0);
    setRegistrationNumber('');
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
          Device Onboarding & Activation
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Activate GPS tracker units, link chassis numbers, configure customer operations, and verify hardware keys.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Onboarding Form */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-[#0e1712] border border-gray-155 dark:border-emerald-950/20 rounded-3xl shadow-sm space-y-6 text-xs">
          
          <h2 className="text-sm font-black uppercase tracking-wider text-emerald-600 border-b border-gray-100 dark:border-emerald-950/15 pb-2">
            1. GPS Hardware Verification
          </h2>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            
            {/* Device ID Input Verification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">Device Hardware ID*</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. dev-onb-902312"
                    value={deviceId}
                    onChange={(e) => {
                      setDeviceId(e.target.value);
                      setIsVerified(false);
                    }}
                    className={`flex-1 p-2.5 rounded-xl border bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white transition-all ${
                      isVerified 
                        ? 'border-emerald-500 bg-emerald-500/5 focus:border-emerald-500' 
                        : 'border-gray-200 dark:border-emerald-950/30 focus:border-emerald-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleSimulateScan}
                    className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl hover:bg-emerald-100/50 cursor-pointer"
                    title="Scan QR Code"
                  >
                    <FaQrcode className="text-sm" />
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  disabled={isVerifying || isVerified || !deviceId}
                  onClick={handleVerifyDevice}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 dark:disabled:bg-emerald-950/10 dark:disabled:text-emerald-800 text-white rounded-xl font-bold shadow-md cursor-pointer disabled:cursor-not-allowed transition-all"
                >
                  {isVerifying ? (
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : isVerified ? (
                    <span className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <FaCheckCircle /> Verified Registry
                    </span>
                  ) : (
                    'Verify Device Registry'
                  )}
                </button>
              </div>
            </div>

            {/* Predefined Vehicle Master Dropdowns */}
            <h2 className="text-sm font-black uppercase tracking-wider text-emerald-600 border-b border-gray-100 dark:border-emerald-950/15 pb-2 pt-2">
              2. Vehicle Specs (Master Database)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Vehicle Type*</label>
                <select
                  value={vehicleType}
                  onChange={(e) => handleVehicleTypeChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white font-bold"
                >
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Brand / Manufacturer*</label>
                <select
                  value={selectedBrand}
                  required
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white font-bold"
                >
                  <option value="">Select Brand</option>
                  {brands.filter(b => b.models.some(m => m.vehicleType === vehicleType)).map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Model Specification*</label>
                <select
                  value={selectedModel}
                  required
                  disabled={!selectedBrand}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white font-bold disabled:opacity-50"
                >
                  <option value="">Select Model</option>
                  {models.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Engine HP Rating*</label>
                <select
                  value={selectedHP}
                  required
                  disabled={!selectedModel}
                  onChange={(e) => setSelectedHP(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white font-bold disabled:opacity-50"
                >
                  <option value="">Select HP</option>
                  {hpOptions.map(hp => <option key={hp} value={hp}>{hp}</option>)}
                </select>
              </div>
            </div>

            {/* Dynamic Series & Engine Configuration */}
            {(vehicleType === 'Tractor' || vehicleType === 'Combine Harvester') && selectedModel && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 bg-gray-50/50 dark:bg-emerald-955/5 p-4 rounded-2xl border border-gray-150 dark:border-emerald-950/20">
                {vehicleType === 'Tractor' && (
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5 font-bold">Series</label>
                    <input
                      type="text"
                      readOnly
                      value={models.find(m => m._id === selectedModel)?.series || 'Standard Series'}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-150 dark:bg-emerald-900/10 dark:text-gray-300 font-bold focus:outline-none"
                    />
                  </div>
                )}
                {vehicleType === 'Combine Harvester' && (
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5 font-bold">Engine Configuration / Type</label>
                    {models.find(m => m._id === selectedModel)?.engineConfig === 'External' ? (
                      <select
                        value={engineType}
                        onChange={(e) => setEngineType(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white font-bold"
                      >
                        <option value="John Deere Engine">John Deere Engine</option>
                        <option value="Ashok Leyland Engine">Ashok Leyland Engine</option>
                        <option value="Cummins Engine">Cummins Engine</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        readOnly
                        value="Factory Integrated Engine"
                        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-150 dark:bg-emerald-900/10 dark:text-gray-300 font-bold focus:outline-none"
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. Service reminder intervals configuration */}
            <h2 className="text-sm font-black uppercase tracking-wider text-emerald-600 border-b border-gray-100 dark:border-emerald-950/15 pb-2 pt-2 mt-4">
              3. Service Reminder Thresholds (Hours)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5 font-bold">First Service Threshold (Hours)*</label>
                <input
                  type="number"
                  required
                  value={firstServiceHours}
                  onChange={(e) => setFirstServiceHours(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5 font-bold">Regular Service Interval (Hours)*</label>
                <input
                  type="number"
                  required
                  value={regularServiceInterval}
                  onChange={(e) => setRegularServiceInterval(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5 font-bold">Last Service Hours (Optional)</label>
                <input
                  type="number"
                  value={lastServiceHours}
                  onChange={(e) => setLastServiceHours(Number(e.target.value))}
                  placeholder="e.g. 0 or last done hours"
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white font-bold"
                />
              </div>
            </div>

            {/* Vehicle Registration & Logistics specifics */}
            <h2 className="text-sm font-black uppercase tracking-wider text-emerald-600 border-b border-gray-100 dark:border-emerald-950/15 pb-2 pt-2 mt-4">
              4. Vehicle Registration & Logistics Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5 font-bold">Chassis Number (Immutable ID)*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CHASSIS-9812-PB"
                  value={chassisNumber}
                  onChange={(e) => setChassisNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5 font-bold">Vehicle Display Custom Name*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swaraj 963 Main #2"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5 font-bold">Registration Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. TS-05-EA-1234"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white uppercase font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Engine Number</label>
                <input
                  type="text"
                  value={engineNumber}
                  onChange={(e) => setEngineNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Manufacturing Year</label>
                <input
                  type="number"
                  value={manufacturingYear}
                  onChange={(e) => setManufacturingYear(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">RC Owner Name</label>
                <input
                  type="text"
                  value={rcOwnerName}
                  onChange={(e) => setRcOwnerName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Vehicle Purchase Date</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Insurance Expiry Date</label>
                <input
                  type="date"
                  value={insuranceExpiry}
                  onChange={(e) => setInsuranceExpiry(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Fitness Certificate Expiry</label>
                <input
                  type="date"
                  value={fitnessExpiry}
                  onChange={(e) => setFitnessExpiry(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white"
                />
              </div>
            </div>

            {/* Device Installation & Service records */}
            <h2 className="text-sm font-black uppercase tracking-wider text-emerald-600 border-b border-gray-100 dark:border-emerald-950/15 pb-2 pt-2">
              3. Device Installation & Service Log
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Installer Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Telematics"
                  value={installerName}
                  onChange={(e) => setInstallerName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Installation Date</label>
                <input
                  type="date"
                  value={installationDate}
                  onChange={(e) => setInstallationDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Installation Location</label>
                <input
                  type="text"
                  placeholder="e.g. Ludhiana Workshop"
                  value={installationLocation}
                  onChange={(e) => setInstallationLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Vehicle Odometer (km)</label>
                <input
                  type="number"
                  value={vehicleOdometer}
                  onChange={(e) => setVehicleOdometer(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">SIM Card ICCID</label>
                <input
                  type="text"
                  placeholder="20-digit SIM ICCID"
                  value={simIccid}
                  onChange={(e) => setSimIccid(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">SIM Network Provider</label>
                <input
                  type="text"
                  value={simProvider}
                  onChange={(e) => setSimProvider(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Device Serial Number</label>
                <input
                  type="text"
                  placeholder="e.g. SN-908123-XY"
                  value={deviceSerialNumber}
                  onChange={(e) => setDeviceSerialNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Warranty Expiry Date</label>
                <input
                  type="date"
                  value={deviceWarranty}
                  onChange={(e) => setDeviceWarranty(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white"
                />
              </div>
            </div>

            {/* Customer & Location Details */}
            <h2 className="text-sm font-black uppercase tracking-wider text-emerald-600 border-b border-gray-100 dark:border-emerald-950/15 pb-2 pt-2">
              4. Customer Registry & Administrative Hierarchy
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Customer / Subscribed Client*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gurpreet Singh Agrotech"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Client Mobile Number (Auth Key)*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +919876543210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Geographical Hierarchy Cascading */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">State</label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white font-semibold"
                >
                  <option value="">Select State</option>
                  {states.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  disabled={!selectedState}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white font-semibold disabled:opacity-50"
                >
                  <option value="">Select District</option>
                  {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Mandal / Block</label>
                <select
                  value={selectedMandal}
                  onChange={(e) => handleMandalChange(e.target.value)}
                  disabled={!selectedDistrict}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white font-semibold disabled:opacity-50"
                >
                  <option value="">Select Mandal</option>
                  {mandals.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Village</label>
                <select
                  value={selectedVillage}
                  onChange={(e) => handleVillageChange(e.target.value)}
                  disabled={!selectedMandal}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white font-semibold disabled:opacity-50"
                >
                  <option value="">Select Village</option>
                  {villages.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div className="md:col-span-2">
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Street Address</label>
                <input
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Pincode</label>
                <input
                  type="text"
                  readOnly
                  placeholder="Auto populated"
                  value={pincode}
                  className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-900/30 bg-gray-150 dark:bg-emerald-950/20 dark:text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 font-bold border-t border-gray-100 dark:border-emerald-950/20">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-emerald-950/20 dark:text-emerald-350 rounded-xl cursor-pointer"
              >
                <FaUndo className="text-[10px]" /> Reset Fields
              </button>
              <button
                type="submit"
                disabled={isActivating || !isVerified}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isActivating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'Complete GPS Onboarding'
                )}
              </button>
            </div>

          </form>

        </div>

        {/* Operations Guidelines */}
        <div className="space-y-6">
          <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-150 dark:border-emerald-950/20 rounded-3xl shadow-sm text-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-450 uppercase tracking-wider flex items-center gap-1.5">
              <FaShieldAlt className="text-emerald-500" />
              Onboarding Guidelines
            </h3>
            <div className="space-y-3 text-gray-650 dark:text-gray-300 leading-relaxed">
              <p>
                1. <strong>Verify Registry:</strong> Verify that the GPS hardware unit identifier (Device ID) is present in the platform's inventory by running a query check first.
              </p>
              <p>
                2. <strong>Master Metadata Selection:</strong> Choose predefined vehicle configuration properties from the India logistics master list. Avoid custom text configurations to maintain database normalization.
              </p>
              <p>
                3. <strong>Geographic Alignment:</strong> Map the client's administrative address to India's official administrative boundary mapping (State &rarr; District &rarr; Mandal &rarr; Village). Pincodes are auto-completed.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* QR scanner Simulator Modal Overlay */}
      <AnimatePresence>
        {isScannerOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0c120f] p-6 rounded-3xl max-w-sm w-full space-y-4 border border-gray-250 dark:border-emerald-900/30 text-center"
            >
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-emerald-950/15 pb-2">
                <span className="text-xs font-black dark:text-white uppercase tracking-wider">QR Code Hardware Scan</span>
                <button onClick={() => setIsScannerOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer">
                  <FaTimes />
                </button>
              </div>

              <div className="relative aspect-square max-w-[240px] mx-auto bg-gray-950 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-emerald-500">
                <FaCamera className="text-4xl text-emerald-500/40 animate-pulse" />
                <div className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-emerald-500 shadow-md animate-bounce top-0" style={{ animationDuration: '3s' }} />
              </div>

              <p className="text-xs font-bold text-gray-500 dark:text-emerald-400">{scanMessage}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DeviceActivation;
