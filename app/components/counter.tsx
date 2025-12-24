import React, { useState, useMemo } from 'react';
import { Mail, MessageCircle, Settings, Users, BarChart2, Bell, Eye, Code, Zap, Check, X, TrendingDown, Package, TrendingUp, Aperture, Loader, Brain } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Global API Key variable (required for the environment)
const apiKey = "";
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

// --- UTILITY FUNCTIONS FOR GEMINI API CALLS ---

/**
 * Handles the POST request to the Gemini API with exponential backoff.
 * @param {object} payload - The request payload.
 * @returns {Promise<string>} The generated text result.
 */
const fetchLLMResponse = async (systemPrompt, userQuery, maxRetries = 5) => {
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Error: Could not extract generated text.";
                return text.trim();
            } else if (response.status === 429 && attempt < maxRetries - 1) {
                // Exponential backoff for rate limiting
                const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw new Error(`API request failed with status: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error("Gemini API call failed:", error);
            if (attempt === maxRetries - 1) {
                return "An error occurred while connecting to the AI service. Please try again.";
            }
        }
    }
    return "Failed to get a response after multiple retries.";
};


// --- MOCK DATA FOR ALL TABS ---
const initialRequestData = [
    { subscriberId: 'sub_001', name: 'Alice', requestedProduct: 'Feature X', date: '2024-10-01' },
    { subscriberId: 'sub_002', name: 'Bob', requestedProduct: 'Feature Y', date: '2024-10-02' },
    { subscriberId: 'sub_003', name: 'Charlie', requestedProduct: 'Feature X', date: '2024-10-03' },
    { subscriberId: 'sub_004', name: 'David', requestedProduct: 'Feature Z', date: '2024-10-04' },
    { subscriberId: 'sub_005', name: 'Eve', requestedProduct: 'Feature Y', date: '2024-10-05' },
    { subscriberId: 'sub_006', name: 'Frank', requestedProduct: 'Feature X', date: '2024-10-06' },
    { subscriberId: 'sub_007', name: 'Grace', requestedProduct: 'Feature Z', date: '2024-10-07' },
    { subscriberId: 'sub_008', name: 'Heidi', requestedProduct: 'Feature Y', date: '2024-10-08' },
    { subscriberId: 'sub_009', name: 'Ivan', requestedProduct: 'Feature X', date: '2024-10-09' },
    { subscriberId: 'sub_010', name: 'Judy', requestedProduct: 'Feature X', date: '2024-10-10' },
    { subscriberId: 'sub_011', name: 'Kevin', requestedProduct: 'Feature Z', date: '2024-10-11' },
    { subscriberId: 'sub_012', name: 'Laura', requestedProduct: 'Feature X', date: '2024-10-12' },
];

const initialSubscribers = [
    { id: 1, product: 'Feature X', variant: 'Prio 1', email: 'customer1@example.com', whatsapp: '', channel: 'Email', status: 'Pending', date: '2024-10-26' },
    { id: 2, product: 'Feature Y', variant: 'Prio 2', email: '', whatsapp: '+1 555 123 4567', channel: 'WhatsApp', status: 'Pending', date: '2024-10-25' },
    { id: 3, product: 'Feature Z', variant: 'Prio 3', email: 'customer3@example.com', whatsapp: '', channel: 'Email', status: 'Notified', date: '2024-10-20' },
    { id: 4, product: 'Feature X', variant: 'Prio 1', email: 'customer4@example.com', whatsapp: '+1 555 987 6543', channel: 'Both', status: 'Pending', date: '2024-10-26' },
    { id: 5, product: 'Feature Y', variant: 'Prio 2', email: 'customer5@example.com', whatsapp: '', channel: 'Email', status: 'Canceled', date: '2024-10-18' },
    { id: 6, product: 'Feature Z', variant: 'Prio 3', email: '', whatsapp: '+1 555 333 4444', channel: 'WhatsApp', status: 'Pending', date: '2024-10-27' },
    { id: 7, product: 'Feature X', variant: 'Prio 1', email: 'customer7@example.com', whatsapp: '', channel: 'Email', status: 'Notified', date: '2024-10-28' },
];

const mockInventory = [
    { id: 101, product: 'Feature X', variant: 'Prio 1', inventory: 3, lowStockThreshold: 5 },
    { id: 102, product: 'Feature Y', variant: 'Prio 2', inventory: 0, lowStockThreshold: 5 },
    { id: 103, product: 'Feature Z', variant: 'Prio 3', inventory: 8, lowStockThreshold: 10 },
];

// Utility function to process raw data into chart data
const useProcessedData = (data) => {
    return useMemo(() => {
        const productCounts = data.reduce((acc, item) => {
            acc[item.requestedProduct] = (acc[item.requestedProduct] || 0) + 1;
            return acc;
        }, {});

        const chartData = Object.keys(productCounts).map(product => ({
            product: product,
            'Subscriber Requests': productCounts[product],
        }));

        return {
            chartData,
            totalRequests: data.length,
            productCounts, // Export counts for AI analysis
        };
    }, [data]);
};

// --- Custom Components ---

const Header = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'dashboard', name: 'Dashboard', icon: BarChart2 },
        { id: 'widget', name: 'Widget Settings', icon: Eye },
        { id: 'channels', name: 'Channels & Templates', icon: Settings },
        { id: 'subscribers', name: 'Subscribers & Logs', icon: Users },
        { id: 'plans', name: 'Plans & Billing', icon: Zap },
    ];

    return (
        <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${activeTab === tab.id
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150`}
                        >
                            <tab.icon
                                className={`${activeTab === tab.id
                                    ? 'text-indigo-500'
                                    : 'text-gray-400 group-hover:text-gray-500'
                                    } -ml-0.5 mr-2 h-5 w-5`}
                                aria-hidden="true"
                            />
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-5 rounded-xl shadow-lg flex items-center justify-between transition duration-300 hover:shadow-xl transform hover:-translate-y-0.5">
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
            <Icon className="w-6 h-6" />
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-3 bg-white border border-gray-200 shadow-xl rounded-lg text-sm">
                <p className="font-semibold text-gray-700">{label}</p>
                <p className="text-blue-500">{`${payload[0].name}: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

const RecentSubscriberTable = ({ subscribers }) => {
    // Sort subscribers by date descending and take the top 5
    const recentSubscribers = useMemo(() => {
        return [...subscribers]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
    }, [subscribers]);

    const getStatusClasses = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300';
            case 'Notified': return 'bg-green-100 text-green-800 ring-1 ring-green-300';
            case 'Canceled': return 'bg-red-100 text-red-800 ring-1 ring-red-300';
            default: return 'bg-gray-100 text-gray-800 ring-1 ring-gray-300';
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-2xl h-full flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Notification Activity</h2>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {recentSubscribers.length > 0 ? (
                            recentSubscribers.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50 transition duration-100">
                                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {sub.product}
                                    </td>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {sub.channel}
                                    </td>
                                    <td className="px-3 py-3 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(sub.status)}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                                    No recent activity.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 pt-4 border-t text-right">
                <button
                    onClick={() => console.log('Simulating navigation to Subscribers & Logs tab')} // Mock action
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
                >
                    View All Logs &rarr;
                </button>
            </div>
        </div>
    );
};

// --- Dashboard Component (Feature 2: Demand Analysis) ---
const DashboardViewContent = ({ productCounts, chartData, totalRequests, lowStockThreshold, inventoryData, totalSubscribedCustomers, pendingNotificationsCount, subscribers }) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');

    // Inventory Analytics Calculation
    const lowStockProducts = useMemo(() => {
        return inventoryData.filter(item => {
            const threshold = item.lowStockThreshold || lowStockThreshold;
            return item.inventory <= threshold;
        });
    }, [inventoryData, lowStockThreshold]);

    // Handle AI analysis generation
    const handleGenerateAnalysis = async () => {
        setAnalysisLoading(true);
        setAnalysisResult('');

        const systemPrompt = "You are a savvy E-commerce Product Analyst. Analyze the provided product request data (JSON) and current low stock items. Provide a concise, single-paragraph summary of the key demand trends and an actionable recommendation for the product manager. Focus on identifying the highest demand items.";

        const userQuery = `Analyze the following data:
    1. Product Request Counts: ${JSON.stringify(productCounts, null, 2)}
    2. Low Stock Items: ${JSON.stringify(lowStockProducts.map(p => ({ product: p.product, inventory: p.inventory })), null, 2)}`;

        const result = await fetchLLMResponse(systemPrompt, userQuery);
        setAnalysisResult(result);
        setAnalysisLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans" id="main-root">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                    <Aperture className="w-8 h-8 mr-3 text-blue-600" />
                    Product Request & Inventory Dashboard
                </h1>
                <p className="text-gray-500 mt-1">Unified visualization of customer requests, inventory status, and key performance indicators.</p>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    title="Total Requests"
                    value={totalRequests}
                    icon={TrendingUp}
                    color="indigo"
                />
                <StatCard
                    title="Total Subscribers"
                    value={totalSubscribedCustomers}
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Pending Notifications"
                    value={pendingNotificationsCount}
                    icon={Bell}
                    color="yellow"
                />
                <StatCard
                    title="Low Stock Alerts"
                    value={lowStockProducts.length}
                    icon={TrendingDown}
                    color="red"
                />
            </div>

            {/* Main Content: Chart (2/3 width) and Recent Activity Table (1/3 width) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Chart Section (2/3 width) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-2xl">
                    <div className='flex justify-between items-center mb-6'>
                        <h2 className="text-xl font-bold text-gray-800">Subscriber Request Breakdown</h2>
                        <button
                            onClick={handleGenerateAnalysis}
                            disabled={analysisLoading}
                            className="flex items-center space-x-2 px-4 py-2 bg-pink-500 text-white font-semibold rounded-lg shadow-md hover:bg-pink-600 transition disabled:bg-pink-300"
                        >
                            {analysisLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                            <span>Generate Demand Analysis ✨</span>
                        </button>
                    </div>

                    {analysisResult && (
                        <div className="mb-6 p-4 bg-purple-50 border-l-4 border-purple-500 text-purple-800 rounded-lg shadow-inner">
                            <h3 className="font-bold mb-1 flex items-center"><Zap className="w-4 h-4 mr-2" /> AI Analysis</h3>
                            <p className="text-sm">{analysisResult}</p>
                        </div>
                    )}

                    <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                layout="horizontal"
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis
                                    dataKey="product"
                                    angle={-15}
                                    textAnchor="end"
                                    height={50}
                                    tickLine={false}
                                    stroke="#6B7280"
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis
                                    label={{ value: 'Requests Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6B7280' } }}
                                    tickLine={false}
                                    stroke="#6B7280"
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    iconType="circle"
                                />
                                <Bar
                                    dataKey="Subscriber Requests"
                                    fill={colors[0]}
                                    radius={[4, 4, 0, 0]}
                                    name="Requests"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity Table (1/3 width) */}
                <div className="lg:col-span-1">
                    <RecentSubscriberTable subscribers={subscribers} />
                </div>
            </div>
        </div>
    );
};


const WidgetSettings = ({ lowStockThreshold, setLowStockThreshold }) => {
    const [buttonText, setButtonText] = useState('Notify Me When Available');
    const [modalTitle, setModalTitle] = useState('Get Notified');
    const [channelOptions, setChannelOptions] = useState({ email: true, whatsapp: true });

    return (
        <div className="space-y-6 p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800">Widget & Inventory Configuration</h2>

            {/* Inventory Settings Card (Low Stock Threshold Feature) */}
            <div className="bg-white shadow-xl rounded-xl p-6 space-y-4 border-l-4 border-yellow-500">
                <h3 className="text-xl font-semibold text-yellow-800 flex items-center"><TrendingDown className="w-6 h-6 mr-2" /> Inventory Alert Settings</h3>
                <p className="text-sm text-gray-600">
                    Define the global stock level at which a product is flagged as "Low Stock" on your dashboard.
                </p>
                <div>
                    <label htmlFor="low-stock-threshold" className="block text-sm font-medium text-gray-700">
                        Global Low Stock Threshold (Units)
                    </label>
                    <input
                        type="number"
                        id="low-stock-threshold"
                        value={lowStockThreshold}
                        min="1"
                        max="100"
                        onChange={(e) => setLowStockThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5"
                    />
                    <p className="text-xs text-gray-500 mt-1">Receive a dashboard alert when inventory falls to this level or below.</p>
                </div>
            </div>

            {/* Widget Settings Card */}
            <div className="bg-white shadow-xl rounded-xl p-6 space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">Widget Appearance and Text</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Button Text */}
                    <div>
                        <label htmlFor="button-text" className="block text-sm font-medium text-gray-700">Button Text (Out of Stock)</label>
                        <input type="text" id="button-text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5" />
                    </div>
                    {/* Modal Title */}
                    <div>
                        <label htmlFor="modal-title" className="block text-sm font-medium text-gray-700">Popup Modal Title</label>
                        <input type="text" id="modal-title" value={modalTitle} onChange={(e) => setModalTitle(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5" />
                    </div>
                </div>

                {/* Channel Options */}
                <div>
                    <h4 className="text-md font-medium text-gray-700 mb-2">Available Notification Channels</h4>
                    <div className="flex items-center space-x-6">
                        <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={channelOptions.email} onChange={(e) => setChannelOptions({ ...channelOptions, email: e.target.checked })} className="h-4 w-4 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                            <span className="ml-2">Email Notification</span>
                        </label>
                        <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={channelOptions.whatsapp} onChange={(e) => setChannelOptions({ ...channelOptions, whatsapp: e.target.checked })} className="h-4 w-4 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                            <span className="ml-2">WhatsApp Notification</span>
                        </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Customers will see input fields for the selected channels.</p>
                </div>

                {/* Preview */}
                <div className="pt-4 border-t">
                    <h4 className="text-md font-semibold text-gray-800 mb-3">Live Preview (Mockup)</h4>
                    <div className="p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex flex-col items-center">
                        <div className="w-64">
                            <p className="text-sm text-gray-600 text-center mb-2">Product is out of stock.</p>
                            <button
                                className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
                                onClick={() => document.getElementById('mock-modal').showModal()}
                            >
                                {buttonText}
                            </button>
                        </div>

                        <dialog id="mock-modal" className="bg-white rounded-xl shadow-2xl p-6 w-96 backdrop:bg-black/50">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">{modalTitle}</h3>
                            <div className="space-y-4">
                                {channelOptions.email && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                        <input type="email" placeholder="john.doe@email.com" className="w-full p-2 border rounded-lg" />
                                    </div>
                                )}
                                {channelOptions.whatsapp && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                                        <input type="tel" placeholder="+1 (555) 000-0000" className="w-full p-2 border rounded-lg" />
                                    </div>
                                )}
                                <button className="w-full py-2 bg-green-500 text-white font-semibold rounded-lg mt-2">Submit Request</button>
                            </div>
                            <button
                                onClick={() => document.getElementById('mock-modal').close()}
                                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                            >
                                &times;
                            </button>
                        </dialog>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-lg hover:bg-indigo-700 transition">
                    Save Settings
                </button>
            </div>
        </div>
    );
};

// --- Channels Component (Feature 1: Template Rewrite) ---
const NotificationChannels = ({ plan }) => {
    const isCustomizationAllowed = plan === 'Pro';

    // State for templates
    const [emailTemplate, setEmailTemplate] = useState(`Hi \{\{customer_name\}\}, Good news! The product \{\{product_name\}\} is back in stock! Shop now: \{\{product_link\}\}`);
    const [whatsappTemplate, setWhatsappTemplate] = useState(`🎉 Stock Alert! \{\{product_name\}\} is back. Click here: \{\{product_link\}\}`);

    const [emailLoading, setEmailLoading] = useState(false);

    const handleRewriteTemplate = async () => {
        if (!isCustomizationAllowed) return;

        setEmailLoading(true);

        const systemPrompt = "You are an expert e-commerce copywriter focused on maximizing email click-through rates (CTR). Rewrite the following email template to make it more engaging, urgent, and action-oriented. Preserve the template variables exactly as written: {{customer_name}}, {{product_name}}, {{product_link}}. The tone should be exciting and high-conversion.";

        const userQuery = `Current Email Template:\n${emailTemplate}`;

        const result = await fetchLLMResponse(systemPrompt, userQuery);

        // Attempt to set the result, handling errors gracefully
        if (result.startsWith("Error:") || result.startsWith("Failed to")) {
            // Keep the loading state off, but don't overwrite a good template with an error message
            console.error("Template rewrite failed:", result);
        } else {
            setEmailTemplate(result);
        }
        setEmailLoading(false);
    };

    return (
        <div className="space-y-6 p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800">Notification Channels & Templates</h2>

            {/* Email Settings Card */}
            <div className="bg-white shadow-xl rounded-xl p-6 space-y-4 border-l-4 border-blue-500">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-blue-800 flex items-center"><Mail className="w-6 h-6 mr-2" /> Email Notifications</h3>
                    <button
                        onClick={handleRewriteTemplate}
                        disabled={!isCustomizationAllowed || emailLoading}
                        className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition 
                ${isCustomizationAllowed && !emailLoading ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-md' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                    >
                        {emailLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                        <span>AI Rewrite ✨</span>
                    </button>
                </div>
                <div className="pt-4 space-y-4">
                    <p className="text-sm text-gray-600">Configure the email template sent to customers. {!isCustomizationAllowed && <span className="text-red-500 font-semibold"> (Pro feature: Upgrade to Pro to customize this template).</span>}</p>
                    <label htmlFor="email-template" className="block text-sm font-medium text-gray-700">Email Body Template</label>
                    <textarea
                        id="email-template"
                        rows="6"
                        value={emailTemplate}
                        onChange={(e) => isCustomizationAllowed && setEmailTemplate(e.target.value)}
                        disabled={!isCustomizationAllowed || emailLoading}
                        className={`w-full p-3 border rounded-lg shadow-sm font-mono text-sm ${!isCustomizationAllowed ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                    />
                    <p className="text-xs text-indigo-600">Available variables: <span className="font-mono">{'{{customer_name}}, {{product_name}}, {{variant_name}}, {{product_link}}'}</span></p>
                </div>
            </div>

            {/* WhatsApp Settings Card */}
            <div className="bg-white shadow-xl rounded-xl p-6 space-y-4 border-l-4 border-green-500">
                <h3 className="text-xl font-semibold text-green-800 flex items-center"><MessageCircle className="w-6 h-6 mr-2" /> WhatsApp Notifications</h3>
                <div className="pt-4 space-y-4">
                    <p className="text-sm text-gray-600">WhatsApp templates require prior approval from Meta. {!isCustomizationAllowed && <span className="text-red-500 font-semibold"> (Pro feature: Upgrade to Pro to customize this template).</span>}</p>
                    <label htmlFor="whatsapp-template" className="block text-sm font-medium text-gray-700">WhatsApp Message Template</label>
                    <textarea
                        id="whatsapp-template"
                        rows="3"
                        value={whatsappTemplate}
                        onChange={(e) => isCustomizationAllowed && setWhatsappTemplate(e.target.value)}
                        disabled={!isCustomizationAllowed}
                        className={`w-full p-3 border rounded-lg shadow-sm font-mono text-sm ${!isCustomizationAllowed ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                    />
                    <p className="text-xs text-indigo-600">Available variables: <span className="font-mono">{'{{product_name}}, {{product_link}}'}</span></p>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    disabled={!isCustomizationAllowed}
                    className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-lg hover:bg-indigo-700 transition disabled:bg-indigo-400 flex items-center"
                >
                    Save Channel Settings
                </button>
            </div>
        </div>
    );
};

const SubscriberLog = ({ subscribers }) => {
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSubscribers = useMemo(() => {
        return subscribers.filter(subscriber => {
            const matchesStatus = filterStatus === 'All' || subscriber.status === filterStatus;
            const matchesSearch = searchTerm === '' ||
                subscriber.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                subscriber.whatsapp.includes(searchTerm);
            return matchesStatus && matchesSearch;
        });
    }, [subscribers, filterStatus, searchTerm]);

    const getStatusClasses = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Notified': return 'bg-green-100 text-green-800';
            case 'Canceled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800">Subscribers and Notification History</h2>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <input
                    type="text"
                    placeholder="Search by product, email, or WhatsApp..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-1/3 p-2.5 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full sm:w-1/6 p-2.5 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Notified">Notified</option>
                    <option value="Canceled">Canceled</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white shadow-xl rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product / Variant</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Subscribed</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSubscribers.length > 0 ? (
                            filteredSubscribers.map((subscriber) => (
                                <tr key={subscriber.id} className="hover:bg-gray-50 transition duration-100">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{subscriber.product}</div>
                                        <div className="text-sm text-gray-500">{subscriber.variant}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {subscriber.email && <div className="flex items-center"><Mail className="w-4 h-4 mr-2 text-blue-500" /> {subscriber.email}</div>}
                                        {subscriber.whatsapp && <div className="flex items-center"><MessageCircle className="w-4 h-4 mr-2 text-green-500" /> {subscriber.whatsapp}</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subscriber.channel}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(subscriber.status)}`}>
                                            {subscriber.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subscriber.date}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    No subscribers match your search or filter criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const PricingPlans = ({ currentPlan, setPlan }) => {
    const plans = [
        {
            name: 'Free',
            price: '$0',
            description: 'Essential features for testing and low volume stores.',
            features: [
                { name: '100 Notification Requests/Month', enabled: true, highlight: 'text-yellow-600' },
                { name: 'Low Stock Alerts', enabled: true },
                { name: 'Product Demand Analytics', enabled: true },
                { name: 'Customizable Templates (AI included)', enabled: false },
            ],
            cta: 'Current Plan',
        },
        {
            name: 'Pro',
            price: '$29',
            description: 'Scale your notifications and unlock advanced customization.',
            features: [
                { name: '1,000 Notification Requests/Month', enabled: true, highlight: 'text-indigo-600' },
                { name: 'Low Stock Alerts', enabled: true },
                { name: 'Product Demand Analytics', enabled: true },
                { name: 'Customizable Templates (AI included)', enabled: true },
            ],
            cta: 'Upgrade Now',
        },
    ];

    return (
        <div className="space-y-10 p-6 max-w-6xl mx-auto">
            <header className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">Choose Your Notification Plan</h2>
                <p className="mt-4 text-lg text-gray-500">
                    Scale your stock alerts and unlock advanced customization.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`bg-white rounded-xl shadow-2xl p-8 transition duration-300 flex flex-col ${currentPlan === plan.name ? 'ring-4 ring-indigo-500 border-2 border-indigo-500' : 'border border-gray-100'
                            }`}
                    >
                        <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                        <p className="mt-4 text-4xl font-extrabold text-gray-900">
                            {plan.price}<span className="text-xl font-medium text-gray-500">/month</span>
                        </p>
                        <p className="mt-4 text-gray-500">{plan.description}</p>

                        <div className="mt-6 flex-grow">
                            <ul className="space-y-3">
                                {plan.features.map((feature) => (
                                    <li key={feature.name} className={`flex items-start ${feature.enabled ? 'text-gray-700' : 'text-gray-400'}`}>
                                        {feature.enabled ? (
                                            <Check className={`flex-shrink-0 h-6 w-6 ${feature.highlight || 'text-indigo-500'}`} />
                                        ) : (
                                            <X className="flex-shrink-0 h-6 w-6 text-gray-400" />
                                        )}
                                        <span className={`ml-3 text-base font-medium ${!feature.enabled && 'line-through'}`}>{feature.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            disabled={currentPlan === plan.name}
                            onClick={() => plan.name !== 'Free' && setPlan(plan.name)}
                            className={`mt-8 w-full py-3 px-6 border border-transparent text-lg font-bold rounded-lg shadow-lg transition duration-150 
                                ${currentPlan === plan.name
                                    ? 'bg-gray-200 text-gray-700 cursor-default'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }`}
                        >
                            {currentPlan === plan.name ? plan.cta : plan.cta}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- Main App Component ---
const App = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [subscribers] = useState(initialSubscribers);
    const [requestData] = useState(initialRequestData);
    const [inventoryData] = useState(mockInventory);
    const [plan, setPlan] = useState('Free');
    const [lowStockThreshold, setLowStockThreshold] = useState(5);

    // Data processing for chart and request volumes
    const { chartData, totalRequests, productCounts } = useProcessedData(requestData);

    // Calculations for Dashboard summary
    const totalSubscribedCustomers = useMemo(() => subscribers.length, [subscribers]);

    const pendingNotificationsCount = useMemo(() => {
        return subscribers.filter(sub => sub.status === 'Pending').length;
    }, [subscribers]);

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardViewContent
                    productCounts={productCounts} // Pass product counts for AI analysis
                    chartData={chartData}
                    totalSubscribedCustomers={totalSubscribedCustomers}
                    pendingNotificationsCount={pendingNotificationsCount}
                    totalRequests={totalRequests}
                    inventoryData={inventoryData}
                    lowStockThreshold={lowStockThreshold}
                    subscribers={subscribers}
                />;
            case 'widget':
                return <WidgetSettings
                    lowStockThreshold={lowStockThreshold}
                    setLowStockThreshold={setLowStockThreshold}
                />;
            case 'channels':
                return <NotificationChannels plan={plan} />;
            case 'subscribers':
                return <SubscriberLog subscribers={subscribers} />;
            case 'plans':
                return <PricingPlans currentPlan={plan} setPlan={setPlan} />;
            default:
                return <DashboardViewContent
                    productCounts={productCounts}
                    chartData={chartData}
                    totalSubscribedCustomers={totalSubscribedCustomers}
                    pendingNotificationsCount={pendingNotificationsCount}
                    totalRequests={totalRequests}
                    inventoryData={inventoryData}
                    lowStockThreshold={lowStockThreshold}
                    subscribers={subscribers}
                />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans antialiased">
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="py-6">
                {renderContent()}
            </main>

            {/* Footer / Branding */}
            <footer className="w-full p-4 text-center text-xs text-gray-500 border-t mt-8">
                Product Request & Analytics Dashboard
            </footer>
        </div>
    );
};

export default App;

