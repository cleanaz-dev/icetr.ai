import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Phone, Plus, Eye } from 'lucide-react';
import ManageCallScriptsDialog from '../../training/dialog/ManageCallScriptsDialog';

export const ManageCallScripts = ({ campaign, onScriptsUpdate }) => {
  console.log("campaign: ", campaign)
  
  return (
    <div className="flex h-[500px]">
      <div className="bg-card rounded-lg border shadow-sm flex-1 flex flex-col">
        <div className="p-6 border-b flex-shrink-0">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-semibold">Call Scripts</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create, edit and manage call scripts
              </p>
            </div>
            <ManageCallScriptsDialog
              scripts={campaign.scripts || []}
              campaignId={campaign.id}
              orgId={campaign.organizationId}
              onScriptsUpdate={onScriptsUpdate}
              trigger={
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Scripts
                </Button>
              }
            />
          </div>
        </div>
        <div className="p-6 flex-1 flex flex-col min-h-0">
          {campaign.scripts && campaign.scripts.length > 0 ? (
            <div className="space-y-4 flex-1 overflow-y-auto">
              {campaign.scripts.map((script, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors flex-shrink-0"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-sm">
                      {script.label}
                    </h4>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      Script
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    <p className="line-clamp-3">
                      {script.content.length > 100
                        ? `${script.content.substring(0, 100)}...`
                        : script.content}
                    </p>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {script.content.split(" ").length} words
                      </span>
                      {/* <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 flex-1 flex flex-col justify-center">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="text-lg font-medium mb-2">
                No Call Scripts Yet
              </h4>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Create standardized call scripts to help your team
                maintain consistent messaging and improve conversion
                rates.
              </p>
              <ManageCallScriptsDialog
                scripts={[]}
                campaignId={campaign.id}
                orgId={campaign.organizationId}
                onScriptsUpdate={onScriptsUpdate}
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Script
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};