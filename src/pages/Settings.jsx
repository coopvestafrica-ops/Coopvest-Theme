import React from 'react'
import MainLayout from '../components/Layout/MainLayout'
import { Settings as SettingsIcon, Lock, Bell, Database } from 'lucide-react'

const Settings = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="section-title">System Settings</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Configure system-wide settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-hover cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Lock className="text-primary-600 dark:text-primary-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">Security Settings</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Manage MFA, IP whitelisting, and security policies
                </p>
              </div>
            </div>
          </div>

          <div className="card-hover cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Bell className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">Notification Preferences</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Configure email, SMS, and in-app notifications
                </p>
              </div>
            </div>
          </div>

          <div className="card-hover cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent-100 dark:bg-accent-900 rounded-lg">
                <Database className="text-accent-600 dark:text-accent-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">Integrations</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Manage API integrations and third-party services
                </p>
              </div>
            </div>
          </div>

          <div className="card-hover cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <SettingsIcon className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">System Configuration</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Configure system parameters and defaults
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Settings
