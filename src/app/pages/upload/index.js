import React from 'react'
import ImageUploadBox from './upload-section'
import TipsCard from './tips';
import Cards from './cards';

const UploadPage = () => {
  return (
    <div>
      <ImageUploadBox />
      <TipsCard />
      <Cards />
    </div>
  )
}

export default UploadPage;
