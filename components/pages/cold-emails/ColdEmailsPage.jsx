"use client"
import React, { useState } from 'react';
import { Plus, Mail, Clock, Workflow, Play, Trash2, Edit } from 'lucide-react';

export default function ColdEmailsPage() {
  const [funnels, setFunnels] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFunnelName, setNewFunnelName] = useState('');

  const createFunnel = () => {
    if (!newFunnelName.trim()) return;
    
    const newFunnel = {
      id: Date.now(),
      name: newFunnelName,
      status: 'draft',
      createdAt: new Date().toLocaleDateString(),
      steps: [],
      stats: { sent: 0, opened: 0, clicked: 0, replied: 0 }
    };
    
    setFunnels([...funnels, newFunnel]);
    setNewFunnelName('');
    setShowCreateForm(false);
  };

  const deleteFunnel = (id) => {
    setFunnels(funnels.filter(f => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cold Email Funnels</h1>
            <p className="text-gray-600 mt-2">Create automated email sequences that convert</p>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            New Funnel
          </button>
        </div>

        {/* Create Funnel Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Funnel</h3>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter funnel name (e.g., SaaS Outreach, Agency Follow-up)"
                value={newFunnelName}
                onChange={(e) => setNewFunnelName(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && createFunnel()}
              />
              <button
                onClick={createFunnel}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewFunnelName('');
                }}
                className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Funnels Grid */}
        {funnels.length === 0 ? (
          <div className="text-center py-12">
            <Mail size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No funnels yet</h3>
            <p className="text-gray-500 mb-6">Create your first cold email funnel to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Create First Funnel
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {funnels.map((funnel) => (
              <div key={funnel.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{funnel.name}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        funnel.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {funnel.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => deleteFunnel(funnel.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{funnel.stats.sent}</div>
                      <div className="text-xs text-gray-500">Sent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{funnel.stats.opened}</div>
                      <div className="text-xs text-gray-500">Opened</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{funnel.stats.clicked}</div>
                      <div className="text-xs text-gray-500">Clicked</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{funnel.stats.replied}</div>
                      <div className="text-xs text-gray-500">Replied</div>
                    </div>
                  </div>

                  {/* Funnel Steps Preview */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Workflow size={14} />
                      {funnel.steps.length} steps configured
                    </div>
                    {funnel.steps.length === 0 && (
                      <div className="text-xs text-gray-400 italic">No steps added yet</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
                      <Edit size={14} />
                      Edit Funnel
                    </button>
                    {funnel.status === 'draft' && (
                      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1 transition-colors">
                        <Play size={14} />
                        Start
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-gray-50 rounded-b-lg border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created {funnel.createdAt}</span>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>Last updated 2h ago</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}