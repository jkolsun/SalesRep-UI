'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Building2,
  Target,
  DollarSign,
  Bell,
  Save,
  Plus,
  Trash2,
  Plug,
  Key,
  ExternalLink,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Mail,
  Database,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState('Bright Automations')
  const [timezone, setTimezone] = useState('America/Los_Angeles')
  const [dailyDialTarget, setDailyDialTarget] = useState(80)
  const [dailyConnectTarget, setDailyConnectTarget] = useState(15)
  const [dailyDemoTarget, setDailyDemoTarget] = useState(3)
  const [leaderboardEnabled, setLeaderboardEnabled] = useState(true)
  const [leaderboardAnonymized, setLeaderboardAnonymized] = useState(false)
  const [slackWebhook, setSlackWebhook] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)

  const [commissionRules, setCommissionRules] = useState([
    { id: '1', type: 'DEMO_BOOKED', amount: 150, description: 'Per qualified demo scheduled', enabled: true },
    { id: '2', type: 'DEMO_COMPLETED', amount: 50, description: 'Bonus when demo is completed', enabled: true },
    { id: '3', type: 'CLOSE', amount: 500, description: 'Per closed deal', enabled: true },
    { id: '4', type: 'RESIDUAL', amount: 5, description: '5% monthly recurring for 12 months', enabled: false },
  ])

  // Integrations state
  const [serperApiKey, setSerperApiKey] = useState('')
  const [serperConnected, setSerperConnected] = useState(false)
  const [constantContactApiKey, setConstantContactApiKey] = useState('')
  const [constantContactConnected, setConstantContactConnected] = useState(false)
  const [selectedCrm, setSelectedCrm] = useState<string>('')
  const [crmApiKey, setCrmApiKey] = useState('')
  const [crmConnected, setCrmConnected] = useState(false)
  const [testingConnection, setTestingConnection] = useState<string | null>(null)

  const handleSave = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your changes have been saved successfully',
      variant: 'success',
    })
  }

  const updateCommissionRule = (id: string, field: string, value: any) => {
    setCommissionRules(
      commissionRules.map((rule) =>
        rule.id === id ? { ...rule, [field]: value } : rule
      )
    )
  }

  const testConnection = async (service: string) => {
    setTestingConnection(service)
    // Simulate API connection test
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (service === 'serper' && serperApiKey) {
      setSerperConnected(true)
      toast({
        title: 'Connection Successful',
        description: 'Serper API is connected and ready to use',
        variant: 'success',
      })
    } else if (service === 'constant-contact' && constantContactApiKey) {
      setConstantContactConnected(true)
      toast({
        title: 'Connection Successful',
        description: 'Constant Contact is connected and ready to use',
        variant: 'success',
      })
    } else if (service === 'crm' && crmApiKey && selectedCrm) {
      setCrmConnected(true)
      toast({
        title: 'Connection Successful',
        description: `${selectedCrm} is connected and ready to use`,
        variant: 'success',
      })
    } else {
      toast({
        title: 'Connection Failed',
        description: 'Please enter a valid API key',
        variant: 'destructive',
      })
    }
    setTestingConnection(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400">Configure your sales platform</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="targets">Daily Targets</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-teal-400" />
                Company Settings
              </CardTitle>
              <CardDescription>
                Basic settings for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Los_Angeles">
                        Pacific Time (PT)
                      </SelectItem>
                      <SelectItem value="America/Denver">
                        Mountain Time (MT)
                      </SelectItem>
                      <SelectItem value="America/Chicago">
                        Central Time (CT)
                      </SelectItem>
                      <SelectItem value="America/New_York">
                        Eastern Time (ET)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-white">Leaderboard</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Enable Leaderboard</p>
                    <p className="text-xs text-gray-500">
                      Show rep rankings to motivate the team
                    </p>
                  </div>
                  <Switch
                    checked={leaderboardEnabled}
                    onCheckedChange={setLeaderboardEnabled}
                  />
                </div>
                {leaderboardEnabled && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Anonymize Names</p>
                      <p className="text-xs text-gray-500">
                        Show initials only (e.g., &quot;S.W.&quot; instead of &quot;Sarah Williams&quot;)
                      </p>
                    </div>
                    <Switch
                      checked={leaderboardAnonymized}
                      onCheckedChange={setLeaderboardAnonymized}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Targets */}
        <TabsContent value="targets">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-teal-400" />
                Daily Targets
              </CardTitle>
              <CardDescription>
                Set daily goals for your sales reps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Daily Dial Target</Label>
                  <Input
                    type="number"
                    value={dailyDialTarget}
                    onChange={(e) => setDailyDialTarget(parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">
                    Number of calls per day
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Daily Connect Target</Label>
                  <Input
                    type="number"
                    value={dailyConnectTarget}
                    onChange={(e) => setDailyConnectTarget(parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">
                    Number of live conversations
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Daily Demo Target</Label>
                  <Input
                    type="number"
                    value={dailyDemoTarget}
                    onChange={(e) => setDailyDemoTarget(parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">
                    Number of demos booked
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-teal-500/10 border border-teal-500/30">
                <p className="text-sm text-teal-400">
                  These targets will be shown to reps on their dashboard and used to calculate
                  &quot;On Track&quot; vs &quot;Behind&quot; status.
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commission Rules */}
        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-400" />
                Commission Structure
              </CardTitle>
              <CardDescription>
                Configure how reps earn commissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {commissionRules.map((rule) => (
                <div
                  key={rule.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    rule.enabled
                      ? 'border-white/10 bg-white/5'
                      : 'border-white/5 bg-white/2 opacity-50'
                  }`}
                >
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={(checked) =>
                      updateCommissionRule(rule.id, 'enabled', checked)
                    }
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="w-40">
                        <Label className="text-gray-400">Type</Label>
                        <p className="font-medium text-white">
                          {rule.type.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div className="w-32">
                        <Label className="text-gray-400">Amount</Label>
                        <div className="flex items-center gap-1">
                          {rule.type === 'RESIDUAL' ? (
                            <Input
                              type="number"
                              value={rule.amount}
                              onChange={(e) =>
                                updateCommissionRule(
                                  rule.id,
                                  'amount',
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-20"
                              disabled={!rule.enabled}
                            />
                          ) : (
                            <Input
                              type="number"
                              value={rule.amount}
                              onChange={(e) =>
                                updateCommissionRule(
                                  rule.id,
                                  'amount',
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-20"
                              disabled={!rule.enabled}
                            />
                          )}
                          <span className="text-gray-400">
                            {rule.type === 'RESIDUAL' ? '%' : '$'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <Label className="text-gray-400">Description</Label>
                        <Input
                          value={rule.description}
                          onChange={(e) =>
                            updateCommissionRule(
                              rule.id,
                              'description',
                              e.target.value
                            )
                          }
                          disabled={!rule.enabled}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Commission Rule
              </Button>

              <Separator />

              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <h4 className="font-medium text-emerald-400 mb-2">
                  Current Structure Summary
                </h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  {commissionRules
                    .filter((r) => r.enabled)
                    .map((rule) => (
                      <li key={rule.id}>
                        • {rule.type.replace(/_/g, ' ')}:{' '}
                        {rule.type === 'RESIDUAL'
                          ? `${rule.amount}%`
                          : formatCurrency(rule.amount)}
                      </li>
                    ))}
                </ul>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations">
          <div className="space-y-6">
            {/* Serper API - Lead Research */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-teal-400" />
                  Serper API
                  {serperConnected ? (
                    <Badge className="ml-2 bg-emerald-500/20 text-emerald-400">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge className="ml-2 bg-gray-500/20 text-gray-400">
                      <XCircle className="mr-1 h-3 w-3" />
                      Not Connected
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Enable AI-powered lead research and personalization for sales reps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value={serperApiKey}
                      onChange={(e) => setSerperApiKey(e.target.value)}
                      placeholder="Enter your Serper API key"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => testConnection('serper')}
                      disabled={testingConnection === 'serper' || !serperApiKey}
                    >
                      {testingConnection === 'serper' ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        'Test'
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Get your API key from{' '}
                    <a
                      href="https://serper.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-400 hover:underline inline-flex items-center gap-1"
                    >
                      serper.dev <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/30">
                  <p className="text-sm text-teal-400">
                    <Zap className="inline h-4 w-4 mr-1" />
                    When connected, reps can research leads before calling to get company info, recent news, and personalized talking points.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Constant Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-orange-400" />
                  Constant Contact
                  {constantContactConnected ? (
                    <Badge className="ml-2 bg-emerald-500/20 text-emerald-400">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge className="ml-2 bg-gray-500/20 text-gray-400">
                      <XCircle className="mr-1 h-3 w-3" />
                      Not Connected
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Sync opted-in leads directly to your email marketing lists
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value={constantContactApiKey}
                      onChange={(e) => setConstantContactApiKey(e.target.value)}
                      placeholder="Enter your Constant Contact API key"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => testConnection('constant-contact')}
                      disabled={testingConnection === 'constant-contact' || !constantContactApiKey}
                    >
                      {testingConnection === 'constant-contact' ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        'Test'
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Get your API key from{' '}
                    <a
                      href="https://developer.constantcontact.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-400 hover:underline inline-flex items-center gap-1"
                    >
                      Constant Contact Developer Portal <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <p className="text-sm text-orange-400">
                    <Mail className="inline h-4 w-4 mr-1" />
                    When connected, you can sync opted-in leads directly to Constant Contact instead of exporting CSV files.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* CRM Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-400" />
                  CRM Integration
                  {crmConnected ? (
                    <Badge className="ml-2 bg-emerald-500/20 text-emerald-400">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge className="ml-2 bg-gray-500/20 text-gray-400">
                      <XCircle className="mr-1 h-3 w-3" />
                      Not Connected
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Sync leads and activities with your existing CRM
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>CRM Platform</Label>
                  <Select value={selectedCrm} onValueChange={setSelectedCrm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your CRM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salesforce">Salesforce</SelectItem>
                      <SelectItem value="hubspot">HubSpot</SelectItem>
                      <SelectItem value="pipedrive">Pipedrive</SelectItem>
                      <SelectItem value="zoho">Zoho CRM</SelectItem>
                      <SelectItem value="close">Close.io</SelectItem>
                      <SelectItem value="custom">Custom API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedCrm && (
                  <div className="space-y-2">
                    <Label>API Key / Access Token</Label>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        value={crmApiKey}
                        onChange={(e) => setCrmApiKey(e.target.value)}
                        placeholder={`Enter your ${selectedCrm} API key`}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={() => testConnection('crm')}
                        disabled={testingConnection === 'crm' || !crmApiKey}
                      >
                        {testingConnection === 'crm' ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          'Test'
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <p className="text-sm text-purple-400">
                    <Database className="inline h-4 w-4 mr-1" />
                    When connected, leads, call logs, and demos will automatically sync to your CRM.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Future Integrations */}
            <Card className="border-dashed border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-400">
                  <Plug className="h-5 w-5" />
                  More Integrations Coming Soon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Twilio', description: 'VoIP & SMS' },
                    { name: 'Calendly', description: 'Scheduling' },
                    { name: 'Zapier', description: 'Automation' },
                    { name: 'Slack', description: 'Notifications' },
                  ].map((integration) => (
                    <div
                      key={integration.name}
                      className="p-4 rounded-lg border border-white/10 bg-white/5 text-center opacity-50"
                    >
                      <p className="font-medium text-white">{integration.name}</p>
                      <p className="text-xs text-gray-500">{integration.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-400" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-white">Slack Integration</h3>
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input
                    value={slackWebhook}
                    onChange={(e) => setSlackWebhook(e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                  />
                  <p className="text-xs text-gray-500">
                    Get notified in Slack when demos are booked or deals close
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-white">Email Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Demo Booked</p>
                      <p className="text-xs text-gray-500">
                        Notify admins when a new demo is scheduled
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Deal Closed</p>
                      <p className="text-xs text-gray-500">
                        Notify admins when a deal is marked as won
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Rep Inactivity</p>
                      <p className="text-xs text-gray-500">
                        Alert when a rep hasn&apos;t logged activity in 2+ hours
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Daily Summary</p>
                      <p className="text-xs text-gray-500">
                        Send end-of-day summary at 6 PM
                      </p>
                    </div>
                    <Switch checked={false} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
