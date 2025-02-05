import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Select, SelectItem } from './ui/select';

const BACKEND_URL = 'https://giraffe-backend-h31u.onrender.com/api'; // Update this URL

export default function App() {
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const [label, setLabel] = useState("");
  const giraffeIDs = ["Giraffe_1", "Giraffe_2", "Giraffe_3"];


  const fetchImage = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/image`);
      if (!response.ok) throw new Error('Failed to load image metadata');
  
      const data = await response.json();
      console.log('Image URL:', data.imageUrl);  // Log the image URL
  
      setImage(`${BACKEND_URL}${data.imageUrl}`);  // Ensure full URL is used
      setImageName(data.imageName);
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  };
  

  useEffect(() => {
    fetchImage();
  }, []); // Important: Empty dependency array to prevent infinite loop

  const handleLabel = async (selectedLabel) => {
    try {
      const response = await fetch(`${BACKEND_URL}/label`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageName, label: selectedLabel })  // Correct imageName is used
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error:', errorData);
        alert(`Error: ${errorData.error}`);
      } else {
        alert('Label submitted successfully!');
        fetchImage();  // Load the next image
      }
    } catch (error) {
      console.error('Network Error:', error);
      alert(`Network error: ${error.message}`);
    }
  };
  
  
  return (
    <div className="flex h-screen">
      <div className="w-1/2 p-4 flex justify-center items-center bg-gray-50">
        {image ? (
          <img src={image} alt="Unlabeled" className="max-w-full max-h-full rounded-xl shadow-lg" />
        ) : (
          <p>Loading image...</p>
        )}
      </div>

      <div className="w-1/2 p-4 overflow-y-auto bg-white shadow-xl">
        <div className="mb-4">
          <Select onValueChange={setLabel} value={label}>
            {giraffeIDs.map((id) => (
              <SelectItem key={id} value={id}>{id}</SelectItem>
            ))}
          </Select>
          <Button onClick={() => handleLabel(label)} disabled={!label} className="mt-2">Submit Label</Button>
        </div>

        <div className="flex space-x-2 mb-4">
          <Button onClick={() => handleLabel('multiple_giraffes')}>Multiple Giraffes</Button>
          <Button onClick={() => handleLabel('no_giraffe')}>No Giraffe</Button>
          <Button onClick={() => handleLabel('unsure')}>Unsure</Button>
        </div>

        <iframe
          src="/reference.pdf"
          title="Giraffe Reference"
          className="w-full h-[70vh] border rounded-xl shadow-lg"
        />
      </div>
    </div>
  );
}
