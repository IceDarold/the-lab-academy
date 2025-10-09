
import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import Input from '../ui/input';
import Label from '../ui/label';
import Button from '../ui/button';

const SettingsPage: React.FC = () => {
  return (
    <div className="w-full space-y-8 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-400">Manage your account and website settings.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
            <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg mt-4 max-w-2xl">
                 <h3 className="text-lg font-medium">General Settings</h3>
                 <p className="text-sm text-gray-400 mb-6">Update your site's basic information.</p>
                 <div className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="siteName">Site Name</Label>
                        <Input id="siteName" defaultValue="ML-Practicum" disabled />
                     </div>
                     <div className="flex justify-end">
                        <Button>Save Changes</Button>
                     </div>
                 </div>
            </div>
        </TabsContent>
        <TabsContent value="integrations">
             <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg mt-4">
                <h3 className="text-lg font-medium">Integrations</h3>
                <p className="text-sm text-gray-400 mt-2">
                    API integration settings will be configured here. Connect to third-party services.
                </p>
             </div>
        </TabsContent>
        <TabsContent value="billing">
            <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg mt-4">
                <h3 className="text-lg font-medium">Billing</h3>
                <p className="text-sm text-gray-400 mt-2">
                    Manage your subscription and view invoices here.
                </p>
             </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
