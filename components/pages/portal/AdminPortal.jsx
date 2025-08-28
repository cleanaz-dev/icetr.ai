"use client"
import React, { useState } from 'react';
import {
  Users,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Star,
  Zap,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Crown,
  Medal,
  Activity,
  BarChart3,
  Clock,
  CheckCircle,
  Settings,
  Plus,
  Edit3,
  Send,
  Eye,
  AlertTriangle,
  Bot,
  Headphones,
  FileText,
  PieChart,
  DollarSign,
  Trash2,
  UserPlus,
  Shield,
  Database,
  Mic,
  Brain,
} from "lucide-react";

export default function AdminPortal({ 
  currentAdmin, 
  teams = [], 
  totalAgents = 0, 
  systemStats = {},
  broadcasts = [] 
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [newBroadcast, setNewBroadcast] = useState({
    title: '',
    message: '',
    type: 'general',
    targetTeams: []
  });

  // Mock data for demonstration
  const mockTeams = teams.length > 0 ? teams : [
    {
      id: '1',
      name: 'Elite Closers',
      members: 8,
      manager: { firstname: 'Sarah', lastname: 'Johnson' },
      performance: { leads: 245, conversionRate: 28.5, revenue: 125000 },
      status: 'active'
    },
    {
      id: '2',
      name: 'AI Specialists',
      members: 6,
      manager: { firstname: 'Mike', lastname: 'Chen' },
      performance: { leads: 189, conversionRate: 31.2, revenue: 98000 },
      status: 'active'
    },
    {
      id: '3',
      name: 'Cold Call Masters',
      members: 10,
      manager: { firstname: 'Emily', lastname: 'Rodriguez' },
      performance: { leads: 198, conversionRate: 25.8, revenue: 110000 },
      status: 'active'
    }
  ];

  const mockStats = {
    totalAgents: totalAgents || 24,
    totalLeads: systemStats.totalLeads || 1247,
    totalRevenue: systemStats.totalRevenue || 485000,
    avgConversionRate: systemStats.avgConversionRate || 28.2,
    activeCalls: systemStats.activeCalls || 12,
    aiTrainingHours: systemStats.aiTrainingHours || 156,
    successfulCalls: systemStats.successfulCalls || 89,
    ...systemStats
  };

  const mockBroadcasts = broadcasts.length > 0 ? broadcasts : [
    {
      id: '1',
      title: 'Q1 Performance Review Results',
      message: 'Congratulations team! We\'ve exceeded our Q1 targets by 15%. Special recognition to the Elite Closers team for outstanding performance.',
      type: 'announcement',
      targetTeams: ['Elite Closers', 'All Teams'],
      sentAt: new Date('2024-01-20'),
      status: 'sent',
      views: 23,
      author: 'Admin'
    },
    {
      id: '2',
      title: 'New AI Training Module Available',
      message: 'We\'ve launched an advanced objection handling AI module. Complete it by end of month for bonus eligibility.',
      type: 'training',
      targetTeams: ['All Teams'],
      sentAt: new Date('2024-01-18'),
      status: 'sent',
      views: 18,
      author: 'Training Dept'
    },
    {
      id: '3',
      title: 'System Maintenance Tonight',
      message: 'The AI calling system will be offline from 11 PM - 2 AM for maintenance. Plan your calls accordingly.',
      type: 'system',
      targetTeams: ['All Teams'],
      sentAt: new Date('2024-01-17'),
      status: 'sent',
      views: 24,
      author: 'IT Team'
    }
  ];

  const handleSendBroadcast = () => {
    if (newBroadcast.title && newBroadcast.message) {
      // In real app, this would make an API call
      console.log('Sending broadcast:', newBroadcast);
      setShowBroadcastModal(false);
      setNewBroadcast({ title: '', message: '', type: 'general', targetTeams: [] });
    }
  };

  const getBroadcastIcon = (type) => {
    switch (type) {
      case 'announcement': return <MessageCircle className="w-4 h-4" />;
      case 'training': return <Award className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getBroadcastColor = (type) => {
    switch (type) {
      case 'announcement': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'training': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'system': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'alert': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Admin Dashboard 🎯
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Managing {mockStats.totalAgents} agents across {mockTeams.length} teams
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowBroadcastModal(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
            Create Broadcast
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <UserPlus className="w-4 h-4" />
            Add Agent
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
            System Settings
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Total Revenue</p>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                ${(mockStats.totalRevenue / 1000).toFixed(0)}K
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-xs text-emerald-600 mt-2">+12% from last month</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Active Calls</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{mockStats.activeCalls}</p>
            </div>
            <Phone className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-xs text-blue-600 mt-2">Live calling sessions</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">AI Training Hours</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{mockStats.aiTrainingHours}</p>
            </div>
            <Brain className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-xs text-purple-600 mt-2">This month</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Conversion Rate</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{mockStats.avgConversionRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-xs text-orange-600 mt-2">System average</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Team Performance Overview
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Monitor and manage your sales teams
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockTeams.map((team) => (
                  <div key={team.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{team.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {team.members} agents • Led by {team.manager.firstname} {team.manager.lastname}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${team.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}>
                        {team.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="font-semibold text-blue-900 dark:text-blue-100">
                          {team.performance.leads}
                        </div>
                        <div className="text-blue-700 dark:text-blue-300">Total Leads</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="font-semibold text-green-900 dark:text-green-100">
                          {team.performance.conversionRate}%
                        </div>
                        <div className="text-green-700 dark:text-green-300">Conversion</div>
                      </div>
                      <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                        <div className="font-semibold text-emerald-900 dark:text-emerald-100">
                          ${(team.performance.revenue / 1000).toFixed(0)}K
                        </div>
                        <div className="text-emerald-700 dark:text-emerald-300">Revenue</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <button className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Eye className="w-3 h-3" />
                        View Details
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Edit3 className="w-3 h-3" />
                        Manage
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Send className="w-3 h-3" />
                        Message Team
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Activity */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                System Activity
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Real-time system events and alerts
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-950">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">AI system updated successfully</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">New conversation models deployed</p>
                  </div>
                  <span className="text-xs text-gray-500">2 min ago</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-950">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">12 agents currently on calls</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Peak activity detected</p>
                  </div>
                  <span className="text-xs text-gray-500">5 min ago</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-950">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Server load at 85%</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Consider scaling if traffic increases</p>
                  </div>
                  <span className="text-xs text-gray-500">15 min ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-lg">
            <div className="p-6 border-b border-indigo-200 dark:border-indigo-800">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                <BarChart3 className="w-5 h-5" />
                Today's Stats
              </h3>
            </div>
            <div className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                    {mockStats.successfulCalls}
                  </div>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300">Successful Calls</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                    {mockStats.totalLeads}
                  </div>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300">Total Leads</p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-indigo-200 dark:border-indigo-700">
                <div className="text-center">
                  <div className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                    {mockStats.totalAgents}
                  </div>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300">Active Agents</p>
                </div>
              </div>
              
              <button className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <PieChart className="w-4 h-4" />
                Detailed Analytics
              </button>
            </div>
          </div>

          {/* AI System Status */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600" />
                AI System Status
              </h3>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-950">
                <span className="text-sm font-medium">Voice AI</span>
                <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">Online</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-950">
                <span className="text-sm font-medium">Lead Scoring</span>
                <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">Active</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-950">
                <span className="text-sm font-medium">Training Module</span>
                <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">Running</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950">
                <span className="text-sm font-medium">Analytics Engine</span>
                <span className="px-2 py-1 text-xs bg-yellow-600 text-white rounded-full">Updating</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Admin Actions
              </h3>
            </div>
            <div className="p-6 space-y-2">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <UserPlus className="w-4 h-4" />
                Add New Agent
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Shield className="w-4 h-4" />
                Manage Permissions
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Database className="w-4 h-4" />
                Export Data
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Settings className="w-4 h-4" />
                System Config
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Management Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            Team Broadcasts
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Send announcements, updates, and alerts to your teams
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {mockBroadcasts.map((broadcast) => (
              <div key={broadcast.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getBroadcastColor(broadcast.type)}`}>
                      {getBroadcastIcon(broadcast.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{broadcast.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {broadcast.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>To: {broadcast.targetTeams.join(', ')}</span>
                        <span>By: {broadcast.author}</span>
                        <span>{broadcast.sentAt.toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {broadcast.views} views
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-red-600 hover:text-red-700">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Broadcast Creation Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Create New Broadcast</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Send a message to your teams
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <input
                  type="text"
                  value={newBroadcast.title}
                  onChange={(e) => setNewBroadcast({...newBroadcast, title: e.target.value})}
                  placeholder="Enter broadcast title..."
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <textarea
                  value={newBroadcast.message}
                  onChange={(e) => setNewBroadcast({...newBroadcast, message: e.target.value})}
                  placeholder="Enter your message..."
                  rows={4}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-800"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <select
                  value={newBroadcast.type}
                  onChange={(e) => setNewBroadcast({...newBroadcast, type: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="general">General</option>
                  <option value="announcement">Announcement</option>
                  <option value="training">Training</option>
                  <option value="system">System Alert</option>
                  <option value="alert">Important Alert</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleSendBroadcast} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Send Broadcast
                </button>
                <button 
                  onClick={() => setShowBroadcastModal(false)}
                  className="flex-1 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}