import React from 'react';
import { Users } from 'lucide-react';

/**
 * Reusable component for displaying a single team member profile.
 */
const TeamMemberCard = ({ name, role, description }) => {
  return (
    <div className="flex flex-col items-center text-center p-4">
      
      {/* Icon/Avatar Area */}
      <div className="
        w-24 h-24 p-4 mb-4
        bg-gray-100
        text-teal-400
        rounded-full
        flex items-center justify-center
      ">
        <Users className="w-10 h-10" /> 
      </div>

      {/* Name and Role */}
      <h3 className="text-lg font-bold text-gray-800 mb-1">{name}</h3>
      <p className="text-sm font-semibold text-teal-500 mb-3">{role}</p>

      {/* Description */}
      <p className="text-sm text-gray-600 max-w-xs leading-relaxed">{description}</p>
    </div>
  );
};

const TeamSection = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'Abdullah',
      role: 'Chief AI Scientist',
      description: 'Expert in AI and NLP for meeting transcription and insight generation.',
    },
    {
      id: 2,
      name: 'Musa',
      role: 'Lead Developer',
      description: 'Full-stack engineer specializing in Next.js, Supabase, and AI integration.',
    },
    {
      id: 3,
      name: 'Essa',
      role: 'Data Scientist',
      description: 'AI researcher focused on meeting summarization and Q&A systems.',
    },
    {
      id: 4,
      name: 'Ali',
      role: 'UX Designer',
      description: 'Designs intuitive dashboards for effortless meeting insights.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-3">
            Meet Our Team
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experts in AI, NLP, and meeting intelligence working together to make your meetings smarter
          </p>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
          {teamMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              name={member.name}
              role={member.role}
              description={member.description}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default TeamSection;
