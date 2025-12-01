import React from 'react'
import AboutBanner from './about-meeting'
import MissionMetrics from './mission-section';
import MeetingFeatures from './speciality';
import TechnologySection from './technology-section';
import TeamSection from './team-section';

const Aboutmeetings = () => {
  return (
    <div>
      <AboutBanner />
      <MissionMetrics />
      <MeetingFeatures />
      <TechnologySection />
      <TeamSection />
    </div>
  )
}

export default Aboutmeetings;
