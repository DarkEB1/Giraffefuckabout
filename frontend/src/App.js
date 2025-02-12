import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Select, SelectItem } from './ui/select';

const BACKEND_URL = 'https://giraffe-backend-h31u.onrender.com'; // Update this URL

export default function App() {
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const [label, setLabel] = useState("");
  const giraffeIDs = ["F01-AnNE", "F02-GEMINA", "F03-PEGGY", "F04-Heartbreaker", "F05-Angry Momma 1", "F06->Ear", "F07-Bumpnotch", "F08-Pine", "F09-Hot Cross Bun", "F10-Eliza", "F11-Michelle", "F12-Scorpion (Evah)", "F13-Whitedot", "F14-Dumbo Sleepy Face (Cheerleader)", "F15-Notch", "F16-Bumpy", "F17-Grasshopper", "F18-Jenny Holmes", "F19-Arrow", "F20-Gelato", "F21-Cookie", "F22-Tara", "F23-Lana", "F24-Angry Momma 2", "F25-Taylor", "F26-Drooly (Flower Power)", "F27-Gabby", "F28-Keister", "F29-Haylo", "F30-Valerie", "F31-Holly", "F32-Sparkles", "F33-Domino", "F34-", "F35-GPS", "F36-Palm", "F37-Gamboge", "F01-Winky", "F02-Roo", "F03-Blonde", "F04-Smiler", "F05-Brookelee", "M01-Hips", "M02-Will Smith", "M03-Speculo", "M04-Good Straits", "M05-Arteides", "M06-Thor", "M07-Dobby", "M08-Magnet", "M09-Carrot", "M10-Boldy", "M11-Craig", "M12-Kyle", "M13-Richie Palmer", "M14-Uno", "M15-Acacia Vincent", "M16-Jeff", "M17-Biscoff", "M18-Cupid", "M19-Madmax", "M20-Valentine", "M21-Mysterio", "M22-Positive Pete", "M23-Maxwell", "M24-Klaus", "M25-Fat Foot Phillip", "M26-Brian", "M27-", "M28-Chuckles", "M29-Ulfor", "M30-Toto", "M31-Houdini", "M01-Pin Cushion", "M02-Cornetto", "M03-Clover", "M04-Dragon", "M05-Blonde", "M06-James Bond", "M07-Dimpelberry", "M08-Tony", "M09-Nova", "M10-Sunny", "M11-Star", "M12-Jigsaw Sam", "M13-Tufty", "M14-", "M15-", "M16-Laurie", "M17-Kaia", "M18-", "M19-", "M20-Hlahlalesi"];

  const fetchImage = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/image`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Server error: ${errorData.error}`);
      }
  
      const data = await response.json();
      console.log('Image Metadata:', data);
      setImageName(data.imageName)
  
      // Use the full URL

  setImage(`${BACKEND_URL}${data.imageUrl}`);
    } catch (error) {
      console.error('Error fetching image:', error);
      alert(`Error: ${error.message}`);
    }
  };
  

  useEffect(() => {
    fetchImage();
  }, []); // Important: Empty dependency array to prevent infinite loop

  const handleLabel = async (selectedLabel) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/label`, {
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
