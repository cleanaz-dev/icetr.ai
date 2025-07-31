"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs-og';
import { Plus, Mic, MessageSquare, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateTrainingDialog({ campaignIds, orgId }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    scenario: {
      description: '',
      objectives: '',
      targetAudience: '',
      keyPoints: []
    },
    scripts: {
      opening: '',
      rebuttal: '',
      features: '',
      closing: ''
    },
    voiceId: '',
    prompt: '',
    webhookUrl: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const addKeyPoint = () => {
    setFormData(prev => ({
      ...prev,
      scenario: {
        ...prev.scenario,
        keyPoints: [...prev.scenario.keyPoints, '']
      }
    }));
  };

  const updateKeyPoint = (index, value) => {
    setFormData(prev => ({
      ...prev,
      scenario: {
        ...prev.scenario,
        keyPoints: prev.scenario.keyPoints.map((point, i) => 
          i === index ? value : point
        )
      }
    }));
  };

  const removeKeyPoint = (index) => {
    setFormData(prev => ({
      ...prev,
      scenario: {
        ...prev.scenario,
        keyPoints: prev.scenario.keyPoints.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Training name is required');
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        name: formData.name.trim(),
        campaignId,
        scenario: {
          description: formData.scenario.description,
          objectives: formData.scenario.objectives,
          targetAudience: formData.scenario.targetAudience,
          keyPoints: formData.scenario.keyPoints.filter(point => point.trim())
        },
        scripts: {
          opening: formData.scripts.opening,
          rebuttal: formData.scripts.rebuttal,
          features: formData.scripts.features,
          closing: formData.scripts.closing
        },
        voiceId: formData.voiceId || null,
        prompt: formData.prompt || null,
        webhookUrl: formData.webhookUrl || null
      };

      const response = await fetch(`/api/org/${orgId}/campaigns/${campaignId}/training`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create training');
      }

      toast.success('Training created successfully');
      setOpen(false);
      // Reset form
      setFormData({
        name: '',
        scenario: {
          description: '',
          objectives: '',
          targetAudience: '',
          keyPoints: []
        },
        scripts: {
          opening: '',
          rebuttal: '',
          features: '',
          closing: ''
        },
        voiceId: '',
        prompt: '',
        webhookUrl: ''
      });
      
      // You might want to trigger a refresh of the parent component here
      // onSuccess?.();
      
    } catch (error) {
      console.error('Create training error:', error);
      toast.error(error.message || 'Failed to create training');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Training
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Training Session</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-2">
            <Label htmlFor="name">Training Name *</Label>
            <Input
              id="name"
              placeholder="Enter training name..."
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <Tabs defaultValue="scenario" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scenario" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Scenario
              </TabsTrigger>
              <TabsTrigger value="scripts" className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Scripts
              </TabsTrigger>
              <TabsTrigger value="ai-settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                AI Settings
              </TabsTrigger>
            </TabsList>

            {/* Scenario Tab */}
            <TabsContent value="scenario" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Training Scenario</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Scenario Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the training scenario..."
                      value={formData.scenario.description}
                      onChange={(e) => handleNestedChange('scenario', 'description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="objectives">Training Objectives</Label>
                    <Textarea
                      id="objectives"
                      placeholder="What should trainees accomplish?"
                      value={formData.scenario.objectives}
                      onChange={(e) => handleNestedChange('scenario', 'objectives', e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Input
                      id="targetAudience"
                      placeholder="Who is the target audience?"
                      value={formData.scenario.targetAudience}
                      onChange={(e) => handleNestedChange('scenario', 'targetAudience', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Key Points to Cover</Label>
                    {formData.scenario.keyPoints.map((point, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Key point ${index + 1}...`}
                          value={point}
                          onChange={(e) => updateKeyPoint(index, e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeKeyPoint(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addKeyPoint}
                    >
                      Add Key Point
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Scripts Tab */}
            <TabsContent value="scripts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Call Scripts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="opening">Opening Script</Label>
                    <Textarea
                      id="opening"
                      placeholder="How should the call begin?"
                      value={formData.scripts.opening}
                      onChange={(e) => handleNestedChange('scripts', 'opening', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="features">Features/Benefits</Label>
                    <Textarea
                      id="features"
                      placeholder="Key features and benefits to highlight..."
                      value={formData.scripts.features}
                      onChange={(e) => handleNestedChange('scripts', 'features', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rebuttal">Objection Handling</Label>
                    <Textarea
                      id="rebuttal"
                      placeholder="How to handle common objections..."
                      value={formData.scripts.rebuttal}
                      onChange={(e) => handleNestedChange('scripts', 'rebuttal', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="closing">Closing Script</Label>
                    <Textarea
                      id="closing"
                      placeholder="How should the call end?"
                      value={formData.scripts.closing}
                      onChange={(e) => handleNestedChange('scripts', 'closing', e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Settings Tab */}
            <TabsContent value="ai-settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bland AI Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="voiceId">Voice ID</Label>
                    <Input
                      id="voiceId"
                      placeholder="Bland AI voice ID..."
                      value={formData.voiceId}
                      onChange={(e) => handleInputChange('voiceId', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prompt">AI Instructions</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Instructions for the AI agent behavior..."
                      value={formData.prompt}
                      onChange={(e) => handleInputChange('prompt', e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      placeholder="https://your-domain.com/webhooks/training"
                      value={formData.webhookUrl}
                      onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} onClick={handleSubmit}>
              {loading ? 'Creating...' : 'Create Training'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}