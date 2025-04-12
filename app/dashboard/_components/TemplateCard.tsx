import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

// Define proper types for the component props
type TemplateCardProps = {
  icon: string;  // URL for the image
  name: string;
  desc: string;
  slug: string;
}

function TemplateCard({ icon, name, desc, slug }: TemplateCardProps) {
  return (
    <Link 
      href={`/dashboard/content/${slug}`}
      prefetch={true}
      className='group w-full block focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-xl'
      aria-label={`Use ${name} template`}
    >
      <div 
        className='
          relative 
          w-full 
          bg-white 
          rounded-xl
          overflow-hidden 
          border border-gray-200
          shadow-sm
          hover:shadow-md
          transition-all 
          duration-300 
          ease-in-out
        '
      >
        {/* Card Content */}
        <div className='p-5 flex flex-col'>
          {/* Header with Icon */}
          <div className='flex items-center justify-between mb-3'>
            {/* Icon Section */}
            <div 
              className='
                w-12 
                h-12 
                rounded-lg
                bg-primary/10 
                flex 
                items-center 
                justify-center
                group-hover:bg-primary/15
                transition-colors
                duration-300
              '
            >
              <Image 
                src={icon} 
                alt={`${name} icon`}
                width={24} 
                height={24}
                className='object-contain'
                priority={true}
              />
            </div>

            {/* Status Badge - Bento style addition */}
            <div className='
              px-3 
              py-1 
              text-xs 
              font-medium 
              rounded-full 
              bg-emerald-50 
              text-emerald-600
              border 
              border-emerald-100
            '>
              Ready to use
            </div>
          </div>

          {/* Text Content */}
          <div className='mb-4'>
            <h2 
              className='
                font-bold 
                text-lg
                mb-2
                text-gray-800 
                group-hover:text-primary
                transition-colors 
                duration-300 
              '
            >
              {name}
            </h2>

            <p 
              className='
                text-gray-500 
                text-sm
                line-clamp-2
              '
            >
              {desc}
            </p>
          </div>

          {/* Footer with Action Button - Bento style */}
          <div className='
            mt-auto 
            pt-3 
            border-t 
            border-gray-100
            flex 
            items-center 
            justify-between
          '>
            <span className='text-xs text-gray-400'>Template</span>
            <div 
              className='
                inline-flex 
                items-center
                text-primary
                text-sm
                font-medium
                group-hover:underline
              '
            >
              <span>Use</span>
              <ArrowRight 
                size={16} 
                className='
                  ml-1
                  transform 
                  transition-transform 
                  group-hover:translate-x-1
                '
              />
            </div>
          </div>
        </div>

        {/* Bento-style hover effect with gradient border */}
        <div 
          className='
            absolute 
            inset-0 
            border-2 
            border-transparent 
            group-hover:border-primary/30 
            rounded-xl 
            transition-all 
            duration-300 
            pointer-events-none
          '
        />
      </div>
    </Link>
  )
}

export default TemplateCard