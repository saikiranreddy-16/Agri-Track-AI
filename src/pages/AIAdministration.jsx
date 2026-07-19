import React, { useState, useEffect } from 'react';
import { 
  FaServer, FaClock, FaHdd, FaDatabase, 
  FaSync, FaToggleOn, FaShieldAlt, FaCogs, FaCheckCircle, FaExclamationTriangle 
} from 'react-icons/fa';
import { 
  getSettings, 
  getStatus, 
  getMetrics, 
  getUsage, 
  changeProvider, 
  clearAICache 
} from '../services/aiAdminService';

export const AIAdministration = () => {
  const [settings, setSettings] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [usage, setUsage] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Form states for switching provider settings
  const [formProvider, setFormProvider] = useState('mock');
  const [formModel, setFormModel] = useState('default');
  const [formTemp, setFormTemp] = useState(0.4);
  const [formMaxTokens, setFormMaxTokens] = useState(2048);
  const [formTimeout, setFormTimeout] = useState(5000);
  const [formCacheMin, setFormCacheMin] = useState(10);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsRes, statusRes, metricsRes, usageRes] = await Promise.all([
        getSettings(),
        getStatus(),
        getMetrics(),
        getUsage()
      ]);

      if (settingsRes.success) {
        setSettings(settingsRes.data);
        setFormProvider(settingsRes.data.provider || 'mock');
        setFormModel(settingsRes.data.model || 'default');
        setFormTemp(settingsRes.data.temperature ?? 0.4);
        setFormMaxTokens(settingsRes.data.maxTokens ?? 2048);
        setFormTimeout(settingsRes.data.timeout ?? 5000);
        setFormCacheMin(settingsRes.data.cacheDuration ?? 10);
      }
      if (statusRes.success) setHealthStatus(statusRes.data);
      if (metricsRes.success) setMetrics(metricsRes.data);
      if (usageRes.success) setUsage(usageRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve AI administration metrics.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProvider = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage(null);
    setError(null);

    try {
      const result = await changeProvider({
        provider: formProvider,
        model: formModel,
        temperature: Number(formTemp),
        maxTokens: Number(formMaxTokens),
        timeout: Number(formTimeout),
        cacheDuration: Number(formCacheMin)
      });

      if (result.success) {
        setMessage('AI provider settings successfully updated.');
        await loadAllAdminData();
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update provider config.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (!window.confirm('Clear all in-memory cache logs?')) return;
    setActionLoading(true);
    setMessage(null);
    setError(null);
    try {
      const result = await clearAICache();
      if (result.success) {
        setMessage('Cache cleared successfully.');
        await loadAllAdminData();
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to clear cache.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <FaSync className="text-3xl text-emerald-600 animate-spin" />
          <span className="text-xs text-gray-500 font-bold">Loading AI System Stats...</span>
        </div>
      </div>
    );
  }

  // Calculate Cache hit rate percentage
  const totalRequests = metrics?.totalRequests || 0;
  const cacheHits = metrics?.cacheHits || 0;
  const cacheHitRate = totalRequests > 0 ? Math.round((cacheHits / totalRequests) * 100) : 0;

  // Calculate success rate percentage
  const successfulRequests = metrics?.successfulRequests || 0;
  const failedRequests = metrics?.failedRequests || 0;
  const successRate = (successfulRequests + failedRequests) > 0 
    ? Math.round((successfulRequests / (successfulRequests + failedRequests)) * 100) 
    : 100;

  const avgLatency = successfulRequests > 0 
    ? Math.round(metrics.totalResponseTime / successfulRequests) 
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-sm">
          <FaShieldAlt className="text-xl" />
        </div>
        <div>
          <h1 className="text-lg font-black dark:text-white">AI Platform Administration</h1>
          <p className="text-xs text-gray-400 font-semibold">Monitor system execution, health diagnostics, dynamic routing caches, and user request metrics.</p>
        </div>
      </div>

      {/* Message Notifications */}
      {message && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-xs text-emerald-700 dark:text-emerald-400 rounded-xl flex items-center gap-2 font-bold shadow-sm">
          <FaCheckCircle className="text-sm shrink-0" />
          {message}
        </div>
      )}
      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs text-red-700 dark:text-red-400 rounded-xl flex items-center gap-2 font-bold shadow-sm">
          <FaExclamationTriangle className="text-sm shrink-0" />
          {error}
        </div>
      )}

      {/* Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-250/20 dark:border-emerald-950/20 rounded-2xl shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Provider</span>
            <FaServer className="text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xl font-black dark:text-white capitalize">{settings?.provider || 'mock'}</h3>
            <span className="text-[10px] text-gray-400 font-bold">Model: {settings?.model || 'default'}</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-250/20 dark:border-emerald-950/20 rounded-2xl shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Avg Latency</span>
            <FaClock className="text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xl font-black dark:text-white">{avgLatency} ms</h3>
            <span className="text-[10px] text-gray-400 font-bold">Success Rate: {successRate}%</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-250/20 dark:border-emerald-950/20 rounded-2xl shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cache Hits</span>
            <FaHdd className="text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xl font-black dark:text-white">{cacheHitRate}%</h3>
            <span className="text-[10px] text-gray-400 font-bold">{cacheHits} of {totalRequests} hits</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-250/20 dark:border-emerald-950/20 rounded-2xl shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Uptime Monitor</span>
            <FaToggleOn className="text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xl font-black dark:text-white">Active</h3>
            <span className="text-[10px] text-gray-400 font-bold">System Cache: {settings?.cacheDuration}m TTL</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Provider Settings Controller Form */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-[#0e1712] border border-gray-250/20 dark:border-emerald-950/20 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <FaCogs className="text-emerald-600 dark:text-emerald-450" />
            <h2 className="text-sm font-extrabold dark:text-white">AI Provider Settings</h2>
          </div>

          <form onSubmit={handleUpdateProvider} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">AI Provider</label>
                <select
                  value={formProvider}
                  onChange={(e) => setFormProvider(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-emerald-950/20 border border-gray-200 dark:border-emerald-950/45 focus:outline-none focus:border-emerald-500 dark:text-white"
                >
                  <option value="mock">Mock Provider (Active)</option>
                  <option value="gemini">Gemini Provider (Active)</option>
                  <option value="openai" disabled>OpenAI Provider (Disabled)</option>
                  <option value="ollama" disabled>Ollama Provider (Disabled)</option>
                  <option value="huggingface" disabled>HuggingFace Provider (Disabled)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Model Key</label>
                <input
                  type="text"
                  value={formModel}
                  onChange={(e) => setFormModel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-emerald-950/20 border border-gray-200 dark:border-emerald-950/45 focus:outline-none focus:border-emerald-500 dark:text-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Temperature (0.0 - 1.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={formTemp}
                  onChange={(e) => setFormTemp(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-emerald-950/20 border border-gray-200 dark:border-emerald-950/45 focus:outline-none focus:border-emerald-500 dark:text-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Max Output Tokens</label>
                <input
                  type="number"
                  value={formMaxTokens}
                  onChange={(e) => setFormMaxTokens(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-emerald-950/20 border border-gray-200 dark:border-emerald-950/45 focus:outline-none focus:border-emerald-500 dark:text-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Timeout (ms)</label>
                <input
                  type="number"
                  value={formTimeout}
                  onChange={(e) => setFormTimeout(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-emerald-950/20 border border-gray-200 dark:border-emerald-950/45 focus:outline-none focus:border-emerald-500 dark:text-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Cache Duration (Minutes)</label>
                <input
                  type="number"
                  value={formCacheMin}
                  onChange={(e) => setFormCacheMin(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-emerald-950/20 border border-gray-200 dark:border-emerald-950/45 focus:outline-none focus:border-emerald-500 dark:text-white font-semibold"
                />
              </div>

            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={handleClearCache}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold border border-gray-250 hover:bg-gray-50 dark:border-emerald-950/40 dark:hover:bg-emerald-950/15 text-gray-650 dark:text-gray-300 rounded-xl transition-all cursor-pointer"
              >
                Clear Memory Cache
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all cursor-pointer"
              >
                {actionLoading ? 'Saving...' : 'Apply Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* In-Memory Provider Health States */}
        <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-250/20 dark:border-emerald-950/20 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <FaDatabase className="text-emerald-600 dark:text-emerald-450" />
            <h2 className="text-sm font-extrabold dark:text-white">Provider Diagnostics</h2>
          </div>

          <div className="space-y-3.5">
            {healthStatus ? (
              Object.entries(healthStatus).map(([key, stat]) => (
                <div key={key} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/50 dark:bg-[#080d0a]/20 border border-gray-100 dark:border-emerald-950/10">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold dark:text-white capitalize">{key}</span>
                    <p className="text-[9px] text-gray-400 font-semibold">Latency: {stat.avgResponseTime}ms</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-500">{stat.totalRequests} calls</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${stat.failedRequests > 0 && stat.successfulRequests === 0 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  </div>
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-400 font-semibold block text-center">No diagnostic statistics loaded.</span>
            )}
          </div>
        </div>

      </div>

      {/* User Usage Log Panel */}
      <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-250/20 dark:border-emerald-950/20 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <FaCogs className="text-emerald-600 dark:text-emerald-450" />
          <h2 className="text-sm font-extrabold dark:text-white">Active User API Usage</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-500 dark:text-gray-400">
            <thead className="text-[10px] text-gray-400 uppercase bg-gray-50 dark:bg-[#080d0a]/30 border-b border-gray-150/10">
              <tr>
                <th className="px-4 py-3 font-bold">User</th>
                <th className="px-4 py-3 font-bold">Role</th>
                <th className="px-4 py-3 font-bold">Provider</th>
                <th className="px-4 py-3 font-bold">Requests</th>
                <th className="px-4 py-3 font-bold">Tokens</th>
                <th className="px-4 py-3 font-bold">Avg Latency</th>
                <th className="px-4 py-3 font-bold">Success Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150/10">
              {usage.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-4 text-center text-xs text-gray-400 font-semibold">
                    No usage records registered.
                  </td>
                </tr>
              ) : (
                usage.map((row) => {
                  const uSuccess = row.successCount || 0;
                  const uFailed = row.failedCount || 0;
                  const uRate = (uSuccess + uFailed) > 0 ? Math.round((uSuccess / (uSuccess + uFailed)) * 100) : 100;
                  return (
                    <tr key={row._id} className="hover:bg-gray-50/20 dark:hover:bg-emerald-950/5">
                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{row.user?.name || 'Deleted User'}</td>
                      <td className="px-4 py-3 font-semibold">{row.user?.role || 'Unknown'}</td>
                      <td className="px-4 py-3 font-semibold capitalize">{row.provider} ({row.model})</td>
                      <td className="px-4 py-3 font-semibold">{row.requestCount}</td>
                      <td className="px-4 py-3 font-semibold">{row.tokenCount}</td>
                      <td className="px-4 py-3 font-semibold">{row.responseTime} ms</td>
                      <td className="px-4 py-3 font-semibold">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${uRate > 80 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'}`}>
                          {uRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AIAdministration;
