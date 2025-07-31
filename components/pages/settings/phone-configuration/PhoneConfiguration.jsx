"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Phone, Mic, Settings, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTeamContext } from '@/context/TeamProvider';
import { useCoreContext } from '@/context/CoreProvider';

export default function PhoneConfiguration() {
  const { orgId } = useTeamContext()
  const { savePhoneConfiguration, phoneConfiguration: initialPhoneConfiguration } = useCoreContext()
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Phone configuration state
  const [config, setConfig] = useState(initialPhoneConfiguration);



const handleSave = async () => {
  setSaving(true);
  try {
    const result = savePhoneConfiguration(config, orgId);
    
    if(!result) {
      toast.error(result.message)
    }

    toast.success("Phone Configuration Settings Successfully")
  } catch (error) {
    toast.error("Failed to save phone configuration");
  } finally {
    setSaving(false);
  }
};
  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Phone className="h-8 w-8" />
            Phone Configuration
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure call recording, transcription, and routing settings
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Recording Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Recording Settings
          </CardTitle>
          <CardDescription>
            Configure when and how calls are recorded
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="recording-enabled">Enable Call Recording</Label>
              <p className="text-sm text-muted-foreground">
                Master switch for all call recording functionality
              </p>
            </div>
            <Switch
              id="recording-enabled"
              checked={config?.recordingEnabled}
              onCheckedChange={(checked) => updateConfig('recordingEnabled', checked)}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="record-inbound">Record Inbound Calls</Label>
                <p className="text-sm text-muted-foreground">
                  Record incoming voicemails
                </p>
              </div>
              <Switch
                id="record-inbound"
                checked={config?.recordInboundCalls}
                onCheckedChange={(checked) => updateConfig('recordInboundCalls', checked)}
                disabled={!config?.recordingEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="record-outbound">Record Outbound Calls</Label>
                <p className="text-sm text-muted-foreground">
                  Record calls you make
                </p>
              </div>
              <Switch
                id="record-outbound"
                checked={config?.recordOutboundCalls}
                onCheckedChange={(checked) => updateConfig('recordOutboundCalls', checked)}
                disabled={!config?.recordingEnabled}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="min-duration">Minimum Outbound Recording Duration (seconds)</Label>
            <Input
              id="min-duration"
              type="number"
              value={config?.minOutboundDuration}
              onChange={(e) => updateConfig('minOutboundDuration', parseInt(e.target.value) || 0)}
              disabled={!config?.recordingEnabled || !config?.recordOutboundCalls}
              className="mt-2 max-w-xs"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Only record outbound calls longer than this duration
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Transcription Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Transcription Settings
          </CardTitle>
          <CardDescription>
            Configure automatic call transcription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="transcription-provider">Transcription Provider</Label>
            <Select
              value={config?.transcriptionProvider}
              onValueChange={(value) => updateConfig('transcriptionProvider', value)}
            >
              <SelectTrigger className="mt-2 max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assemblyai">Assembly AI</SelectItem>
                <SelectItem value="twilio">Twilio</SelectItem>
                <SelectItem value="none">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="transcribe-inbound">Transcribe Inbound Calls</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically transcribe voicemails
                </p>
              </div>
              <Switch
                id="transcribe-inbound"
                checked={config?.transcribeInbound}
                onCheckedChange={(checked) => updateConfig('transcribeInbound', checked)}
                disabled={config?.transcriptionProvider === 'none'}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="transcribe-outbound">Transcribe Outbound Calls</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically transcribe your calls
                </p>
              </div>
              <Switch
                id="transcribe-outbound"
                checked={config?.transcribeOutbound}
                onCheckedChange={(checked) => updateConfig('transcribeOutbound', checked)}
                disabled={config?.transcriptionProvider === 'none'}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call Flow Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Call Flow Settings</CardTitle>
          <CardDescription>
            Configure how incoming calls are handled
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="inbound-flow">Inbound Call Handling</Label>
            <Select
              value={config?.inboundFlow}
              onValueChange={(value) => updateConfig('inboundFlow', value)}
            >
              <SelectTrigger className="mt-2 max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="voicemail">Send to Voicemail</SelectItem>
                <SelectItem value="forward">Forward to Number</SelectItem>
                <SelectItem value="ivr">Interactive Voice Response</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config?.inboundFlow === 'voicemail' && (
            <div>
              <Label htmlFor="voicemail-message">Custom Voicemail Message</Label>
              <Textarea
                id="voicemail-message"
                value={config?.voicemailMessage || ""}
                onChange={(e) => updateConfig('voicemailMessage', e.target.value)}
                placeholder="Leave empty to use default message"
                className="mt-2"
                rows={3}
              />
            </div>
          )}

          {config?.inboundFlow === 'forward' && (
            <div>
              <Label htmlFor="forward-number">Forward to Number</Label>
              <Input
                id="forward-number"
                type="tel"
                value={config?.forwardToNumber}
                onChange={(e) => updateConfig('forwardToNumber', e.target.value)}
                placeholder="+1234567890"
                className="mt-2 max-w-xs"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Logic Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Business Logic</CardTitle>
          <CardDescription>
            Configure automatic lead and follow-up creation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-leads">Auto-create Leads</Label>
              <p className="text-sm text-muted-foreground">
                Automatically create leads from unknown callers
              </p>
            </div>
            <Switch
              id="auto-leads"
              checked={config?.autoCreateLeads}
              onCheckedChange={(checked) => updateConfig('autoCreateLeads', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-followups">Auto-create Follow-ups</Label>
              <p className="text-sm text-muted-foreground">
                Automatically create follow-ups for known leads
              </p>
            </div>
            <Switch
              id="auto-followups"
              checked={config?.autoCreateFollowUps}
              onCheckedChange={(checked) => updateConfig('autoCreateFollowUps', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}