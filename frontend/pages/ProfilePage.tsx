import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { UpdateProfileSchema, UpdateProfileData, ChangePasswordSchema, ChangePasswordData } from '../lib/validators/auth';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const ProfilePage = () => {
  const { user } = useAuth();

  const profileForm = useForm<UpdateProfileData>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
    },
  });

  const passwordForm = useForm<ChangePasswordData>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  const { formState: { errors: profileErrors, isSubmitting: isSubmittingProfile } } = profileForm;
  const { formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword }, reset: resetPasswordForm } = passwordForm;


  const onProfileSubmit = async (data: UpdateProfileData) => {
    // In a real app, you would call an API service here.
    console.log("Updating profile with:", data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Profile updated successfully!');
    // In a real app, also update the user context: auth.updateUser({ fullName: data.fullName });
  };

  const onPasswordSubmit = async (data: ChangePasswordData) => {
    // In a real app, you would call an API service here.
    console.log("Changing password for user:", user?.email);
    // You'd typically not log the password data.
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    toast.success('Password changed successfully!');
    resetPasswordForm(); // Clear the form fields
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Profile Settings
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Manage your personal information and password.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        
        <aside className="md:col-span-1">
          <nav className="space-y-1">
             <a href="#" className="bg-indigo-50 dark:bg-gray-800 text-indigo-700 dark:text-indigo-400 group flex items-center px-3 py-2 text-sm font-medium rounded-md" aria-current="page">
                <svg className="text-indigo-500 dark:text-indigo-400 flex-shrink-0 -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                <span className="truncate">Profile</span>
             </a>
          </nav>
        </aside>
        
        <main className="md:col-span-2 space-y-8">
          
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
            <Card className="!p-0">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Personal Information</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update your name and email address.</p>
                    <div className="mt-6 space-y-6">
                        <Input
                            id="email-address"
                            label="Email address"
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="bg-gray-100 dark:bg-gray-700/50"
                        />
                        <Input
                            id="full-name"
                            label="Full Name"
                            type="text"
                            {...profileForm.register('fullName')}
                            error={profileErrors.fullName?.message as string}
                            disabled={isSubmittingProfile}
                        />
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 text-right rounded-b-lg">
                    <Button type="submit" variant="primary" loading={isSubmittingProfile}>
                        Save Changes
                    </Button>
                </div>
            </Card>
          </form>

          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
            <Card className="!p-0">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Change Password</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Ensure your account is using a long, random password to stay secure.</p>
                    <div className="mt-6 space-y-6">
                        <Input
                            id="current-password"
                            label="Current Password"
                            type="password"
                            {...passwordForm.register('currentPassword')}
                            error={passwordErrors.currentPassword?.message as string}
                            disabled={isSubmittingPassword}
                        />
                        <Input
                            id="new-password"
                            label="New Password"
                            type="password"
                            {...passwordForm.register('newPassword')}
                            error={passwordErrors.newPassword?.message as string}
                            disabled={isSubmittingPassword}
                        />
                        <Input
                            id="confirm-password"
                            label="Confirm New Password"
                            type="password"
                            {...passwordForm.register('confirmPassword')}
                            error={passwordErrors.confirmPassword?.message as string}
                            disabled={isSubmittingPassword}
                        />
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 text-right rounded-b-lg">
                    <Button type="submit" variant="primary" loading={isSubmittingPassword}>
                    Change Password
                    </Button>
                </div>
            </Card>
          </form>

        </main>
      </div>
    </div>
  );
};

export default ProfilePage;