import React from 'react'
import { CreateOrgForm } from '../components/create-org-form';

export default function OnboardingCreateView() {
  return (
    <div className="max-w-md mx-auto py-16">
      <h1 className="text-2xl font-semibold mb-2">Create your organization</h1>
      <p className="text-muted-foreground mb-6">
        This is the workspace where your social accounts and scheduled posts will live.
      </p>
      <CreateOrgForm />
    </div>
  );
}
