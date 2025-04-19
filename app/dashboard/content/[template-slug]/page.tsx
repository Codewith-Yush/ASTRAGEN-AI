'use client'

import React, { useContext, useState, useEffect } from 'react';
import FormSection from '../_components/FormSection';
import OutputSection from '../_components/OutputSection';
import { TEMPLATE } from '../../_components/TemplateListSection';
import Templates from '@/app/(data)/Templates';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { chatSession } from '@/utils/AiModal';
import { db } from '@/utils/db';
import { AIOutput } from '@/utils/schema';
import { TotalUsageContext } from '@/app/(context)/TotalUsageContext';
import { useRouter } from 'next/navigation';
import { UserSubscriptionContext } from '@/app/(context)/UserSubscriptionContext';
import { UpdateCreditUsageContext } from '@/app/(context)/UpdateCreditUsageContext';
import { useUser } from '@clerk/nextjs';

interface PROPS {
  params: Promise<{ 'template-slug': string }>;
}

function CreateNewContent(props: PROPS) {
  const [templateSlug, setTemplateSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<string>('');
  const { user } = useUser();
  const router = useRouter();
  const { totalUsage } = useContext(TotalUsageContext);
  const { userSubscription } = useContext(UserSubscriptionContext);
  const { setUpdateCreditUsage } = useContext(UpdateCreditUsageContext);

  useEffect(() => {
    props.params.then((resolvedParams) => {
      setTemplateSlug(resolvedParams['template-slug']);
    });
  }, [props.params]);

  const selectedTemplate: TEMPLATE | undefined = templateSlug
    ? Templates?.find((item) => item.slug === templateSlug)
    : undefined;

  const GenerateAIContent = async (formData: any) => {
    if (!templateSlug || !selectedTemplate) {
      console.error('Template not loaded yet. Please wait.');
      return;
    }

    if (totalUsage >= 300000 && !userSubscription) {
      console.log('Please Upgrade');
      router.push('/dashboard/billing');
      return;
    }

    setLoading(true);
    const SelectedPrompt = selectedTemplate.aiPrompt; // TypeScript will now ensure this is defined
    const FinalAIPrompt = JSON.stringify(formData) + ', ' + SelectedPrompt;

    try {
      const result = await chatSession.sendMessage(FinalAIPrompt);
      const responseText = result?.response?.text ? await result.response.text() : '';
      setAiOutput(responseText);
      await SaveInDb(JSON.stringify(formData), selectedTemplate.slug, responseText);
    } catch (error) {
      console.error('Error generating AI content:', error);
    } finally {
      setLoading(false);
      setUpdateCreditUsage(Date.now());
    }
  };

  const SaveInDb = async (formData: string, slug: string, aiResp: string) => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      console.warn('User email is missing, skipping DB save.');
      return;
    }

    try {
      const result = await db.insert(AIOutput).values({
        formData,
        templateSlug: slug,
        aiResponse: aiResp,
        createdBy: user.primaryEmailAddress.emailAddress,
        createdAt: new Date(),
      });
      console.log('Saved in DB:', result);
    } catch (error) {
      console.error('Error saving in DB:', error);
    }
  };

  const handleEdit = async (newContent: string) => {
    if (!selectedTemplate?.slug || !user?.primaryEmailAddress?.emailAddress) return;
    setAiOutput(newContent);
    await SaveInDb(
      JSON.stringify({ edited: true }),
      selectedTemplate.slug,
      newContent
    );
  };

  return (
    <div className="p-5">
      <Link href={'/dashboard'}>
        <Button>
          <ArrowLeft /> Back
        </Button>
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 py-5">
        {templateSlug && selectedTemplate ? (
          <FormSection
            selectedTemplate={selectedTemplate}
            userFormInput={(v: any) => GenerateAIContent(v)}
            loading={loading}
          />
        ) : (
          <p>Loading template...</p>
        )}
        <div className="col-span-2 overflow-visible">
          <OutputSection
            aiOutput={aiOutput}
            onEdit={handleEdit}
            readOnly={false}
            theme="light"
          />
        </div>
      </div>
    </div>
  );
}

export default CreateNewContent;