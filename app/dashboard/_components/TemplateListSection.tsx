import Templates from '@/app/(data)/Templates'
import React, { useMemo } from 'react'
import TemplateCard from './TemplateCard'

export interface TEMPLATE {
  name: string,
  desc: string,
  icon: string,
  category: string,
  slug: string,
  aiPrompt: string,
  form?: FORM[]
}

export interface FORM {
  label: string,
  field: string,
  name: string,
  required?: boolean
}

function TemplateListSection({ userSearchInput }: { userSearchInput: string }) {
  // Use useMemo instead of useState + useEffect for filtering
  const templateList = useMemo(() => {
    if (!userSearchInput) return Templates;
    
    const lowerCaseInput = userSearchInput.toLowerCase();
    return Templates.filter(item => 
      item.name.toLowerCase().includes(lowerCaseInput)
    );
  }, [userSearchInput]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-10">
      {templateList.map((item: TEMPLATE) => (
        <TemplateCard key={item.slug || item.name} {...item} />
      ))}
    </div>
  );
}

export default React.memo(TemplateListSection);