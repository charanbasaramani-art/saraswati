import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ThemeProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  User, Lock, Palette, Bell, Shield, Camera, Check, Moon, Sun, Monitor,
  Save, Eye, EyeOff, ShieldCheck, Clock, Database, Trash2,
  AlertTriangle, FileText, Fingerprint, HardDrive, CalendarDays, ShieldAlert, Zap
} from 'lucide-react';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Privacy & Data Control state
  const [privacyMode, setPrivacyMode] = useState(false);
  const [autoDeleteTimer, setAutoDeleteTimer] = useState('never');
  const [localAnalysis, setLocalAnalysis] = useState(false);
  const [lastUploadDate, setLastUploadDate] = useState<string | null>(null);
  const [hasStoredData, setHasStoredData] = useState(false);
  const [isDeletingData, setIsDeletingData] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchDataInfo = async () => {
      const { data: resumes } = await supabase
        .from('resumes')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      if (resumes && resumes.length > 0) {
        setLastUploadDate(resumes[0].created_at);
        setHasStoredData(true);
      } else {
        setLastUploadDate(null);
        setHasStoredData(false);
      }
    };
    fetchDataInfo();
  }, [user]);

  const handleDeleteAllData = async () => {
    if (!user) return;
    setIsDeletingData(true);
    try {
      await supabase.from('resume_analyses').delete().eq('user_id', user.id);
      await supabase.from('ats_results').delete().eq('user_id', user.id);
      await supabase.from('soft_skill_analyses').delete().eq('user_id', user.id);
      await supabase.from('resumes').delete().eq('user_id', user.id);
      setHasStoredData(false);
      setLastUploadDate(null);
      toast({ title: "All data deleted", description: "Your resume data and analyses have been permanently removed." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete data", variant: "destructive" });
    } finally {
      setIsDeletingData(false);
    }
  };

  const currentLanguage = languages.find(
    (lang) => i18n.language?.startsWith(lang.code)
  ) || languages[0];

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdatingProfile(true);
    try {
      const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('user_id', user.id);
      if (error) throw error;
      toast({ title: "Profile updated", description: "Your profile has been updated successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update profile", variant: "destructive" });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password updated", description: "Your password has been updated successfully." });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update password", variant: "destructive" });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('user_id', user.id);
      if (updateError) throw updateError;
      setAvatarUrl(publicUrl);
      toast({ title: "Avatar updated", description: "Your profile picture has been updated." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to upload avatar", variant: "destructive" });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    toast({ title: "Language changed", description: `Language has been changed to ${languages.find(l => l.code === code)?.name}` });
  };

  const settingsTabs = [
    { value: 'profile', label: 'Profile', icon: User },
    { value: 'security', label: 'Security', icon: Lock },
    { value: 'appearance', label: 'Appearance', icon: Palette },
    { value: 'language', label: 'Language', icon: Globe },
    { value: 'notifications', label: 'Notifications', icon: Bell },
    { value: 'privacy', label: 'Privacy', icon: Shield },
  ];

  return (
    <Layout>
      <div className="container py-8 animate-fade-in">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-7 w-7 text-gold diya-glow" />
            <h1 className="text-3xl font-bold font-serif text-foreground animate-fade-in-up">Settings</h1>
          </div>
          <p className="text-muted-foreground mt-2 animate-fade-in-up stagger-1">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="manuscript-card p-1.5 h-auto flex-wrap gap-1 animate-fade-in-up stagger-2">
            {settingsTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6 animate-fade-in-up">
            <Card className="manuscript-card corner-ornament">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your profile information and avatar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 border-4 border-primary/20 transition-all duration-300 group-hover:border-primary/40">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="h-6 w-6 text-primary-foreground" />
                    </label>
                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{user?.email}</h3>
                    <p className="text-sm text-muted-foreground">Click on the avatar to upload a new photo</p>
                    {isUploadingAvatar && <p className="text-sm text-primary animate-pulse">Uploading...</p>}
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="glass" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email || ''} disabled className="glass opacity-60" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <Button onClick={handleUpdateProfile} disabled={isUpdatingProfile} className="btn-plaque">
                    <Save className="h-4 w-4 mr-2" />
                    {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6 animate-fade-in-up">
            <Card className="manuscript-card corner-ornament">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: 'currentPassword', label: 'Current Password', value: currentPassword, setter: setCurrentPassword, show: showCurrentPassword, toggleShow: () => setShowCurrentPassword(!showCurrentPassword) },
                  { id: 'newPassword', label: 'New Password', value: newPassword, setter: setNewPassword, show: showNewPassword, toggleShow: () => setShowNewPassword(!showNewPassword) },
                  { id: 'confirmPassword', label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword, show: showConfirmPassword, toggleShow: () => setShowConfirmPassword(!showConfirmPassword) },
                ].map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <div className="relative">
                      <Input id={field.id} type={field.show ? 'text' : 'password'} placeholder={`Enter ${field.label.toLowerCase()}`} value={field.value} onChange={(e) => field.setter(e.target.value)} className="glass pr-10" />
                      <button type="button" onClick={field.toggleShow} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {field.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ))}
                <Button onClick={handleUpdatePassword} disabled={isUpdatingPassword || !newPassword || !confirmPassword} className="btn-plaque">
                  <Lock className="h-4 w-4 mr-2" />
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6 animate-fade-in-up">
            <Card className="manuscript-card corner-ornament">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Theme
                </CardTitle>
                <CardDescription>Choose your preferred theme for the application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { value: 'light', label: 'Light', icon: Sun, description: 'Light background with dark text' },
                    { value: 'dark', label: 'Dark', icon: Moon, description: 'Dark background with light text' },
                    { value: 'system', label: 'System', icon: Monitor, description: 'Follow system preferences' },
                  ].map((themeOption) => (
                    <button
                      key={themeOption.value}
                      onClick={() => setTheme(themeOption.value as 'light' | 'dark' | 'system')}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                        theme === themeOption.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 glass'
                      }`}
                    >
                      {theme === themeOption.value && (
                        <div className="absolute top-2 right-2 h-5 w-5 bg-primary rounded-full flex items-center justify-center animate-bounce-in z-10">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                      <themeOption.icon className={`h-8 w-8 mb-2 relative z-10 ${theme === themeOption.value ? 'text-primary' : 'text-muted-foreground'}`} />
                      <h4 className="font-medium relative z-10">{themeOption.label}</h4>
                      <p className="text-xs text-muted-foreground mt-1 relative z-10">{themeOption.description}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Language Settings */}
          <TabsContent value="language" className="space-y-6 animate-fade-in-up">
            <Card className="manuscript-card corner-ornament">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5 text-primary" />
                  Language
                </CardTitle>
                <CardDescription>Select your preferred language for the interface</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                        currentLanguage.code === language.code ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 glass'
                      }`}
                    >
                      {currentLanguage.code === language.code && (
                        <div className="absolute top-2 right-2 h-5 w-5 bg-primary rounded-full flex items-center justify-center animate-bounce-in">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                      <span className="text-3xl mb-2 block">{language.flag}</span>
                      <h4 className="font-medium">{language.nativeName}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{language.name}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6 animate-fade-in-up">
            <Card className="manuscript-card corner-ornament">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: 'Email Notifications', desc: 'Receive email notifications about your account activity', checked: emailNotifications, onChange: setEmailNotifications },
                  { label: 'Push Notifications', desc: 'Receive push notifications in your browser', checked: pushNotifications, onChange: setPushNotifications },
                  { label: 'Marketing Emails', desc: 'Receive emails about new features and updates', checked: marketingEmails, onChange: setMarketingEmails },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-lg glass">
                    <div className="space-y-0.5">
                      <Label className="text-base">{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={item.checked} onCheckedChange={item.onChange} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy & Data Control */}
          <TabsContent value="privacy" className="space-y-6 animate-fade-in-up">
            {localAnalysis && (
              <div className="flex items-center gap-2 animate-fade-in">
                <Badge className="bg-primary/15 text-primary border-primary/30 gap-1.5 py-1 px-3">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  High Privacy Mode Enabled
                </Badge>
              </div>
            )}

            {/* Privacy Mode Toggle */}
            <Card className="manuscript-card corner-ornament overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Fingerprint className="h-5 w-5 text-primary" />
                  </div>
                  Privacy Mode
                </CardTitle>
                <CardDescription>Control how your data is handled during analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30">
                  <div className="space-y-1 pr-4">
                    <Label className="text-base font-medium">Enable Privacy Mode</Label>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      When enabled, uploaded resumes are auto-deleted after analysis, personal details are masked during AI scoring, and no data is stored permanently.
                    </p>
                  </div>
                  <Switch checked={privacyMode} onCheckedChange={setPrivacyMode} />
                </div>
                {privacyMode && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
                    {[
                      { icon: Trash2, label: 'Auto-delete files', desc: 'After analysis' },
                      { icon: EyeOff, label: 'Mask personal info', desc: 'Name, email, phone' },
                      { icon: Database, label: 'No storage', desc: 'Data not saved' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <item.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Auto-Delete Timer */}
            <Card className="manuscript-card corner-ornament overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/5 pointer-events-none" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  Auto-Delete Timer
                </CardTitle>
                <CardDescription>Choose when your uploaded data should be automatically deleted</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <div className="max-w-sm">
                  <Select value={autoDeleteTimer} onValueChange={setAutoDeleteTimer}>
                    <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50">
                      <SelectValue placeholder="Select auto-delete timing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never (keep all data)</SelectItem>
                      <SelectItem value="immediate">Delete immediately after analysis</SelectItem>
                      <SelectItem value="24h">Delete after 24 hours</SelectItem>
                      <SelectItem value="7d">Delete after 7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border/30">
                  {autoDeleteTimer === 'never' && (
                    <p className="text-sm text-muted-foreground flex items-start gap-2">
                      <HardDrive className="h-4 w-4 mt-0.5 shrink-0" />
                      Your resume files and analysis results will be kept indefinitely for history and progress tracking.
                    </p>
                  )}
                  {autoDeleteTimer === 'immediate' && (
                    <p className="text-sm text-muted-foreground flex items-start gap-2">
                      <Zap className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                      Files are permanently deleted right after analysis completes. No data is retained on our servers.
                    </p>
                  )}
                  {autoDeleteTimer === '24h' && (
                    <p className="text-sm text-muted-foreground flex items-start gap-2">
                      <Clock className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                      Files are kept for 24 hours so you can review results, then automatically purged from all storage.
                    </p>
                  )}
                  {autoDeleteTimer === '7d' && (
                    <p className="text-sm text-muted-foreground flex items-start gap-2">
                      <CalendarDays className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                      Files are retained for 7 days for extended review, then permanently deleted along with all analysis data.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Local Analysis Preference */}
            <Card className="manuscript-card corner-ornament overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShieldAlert className="h-5 w-5 text-primary" />
                  </div>
                  Local Analysis Preference
                </CardTitle>
                <CardDescription>Process your resume without storing any content permanently</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30">
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-base font-medium">Enable Local Analysis</Label>
                      {localAnalysis && <Badge variant="secondary" className="text-xs">Active</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      When enabled, your resume is processed in a temporary session. No content, scores, or personal data is stored after the browser tab is closed.
                    </p>
                  </div>
                  <Switch checked={localAnalysis} onCheckedChange={setLocalAnalysis} />
                </div>
              </CardContent>
            </Card>

            {/* Data Transparency Panel */}
            <Card className="manuscript-card corner-ornament overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/3 via-transparent to-destructive/3 pointer-events-none" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  Data Transparency
                </CardTitle>
                <CardDescription>View and manage all data associated with your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Last Resume Upload</p>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      {lastUploadDate
                        ? new Date(lastUploadDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                        : 'No uploads yet'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Data Currently Stored</p>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" />
                      {hasStoredData ? (
                        <span className="text-primary">Yes — resumes & analyses</span>
                      ) : (
                        <span className="text-muted-foreground">No data stored</span>
                      )}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                  <div className="space-y-1">
                    <h4 className="font-medium text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Delete All Data
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently remove all resumes, analyses, ATS results, and soft skill data. This cannot be undone.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="shrink-0" disabled={!hasStoredData}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete All Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all your uploaded resumes, analysis results, ATS scores, and soft skill evaluations. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          {isDeletingData ? 'Deleting...' : 'Yes, delete everything'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm">
                  <h4 className="font-medium text-destructive">Delete Account</h4>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" size="sm">Delete My Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
