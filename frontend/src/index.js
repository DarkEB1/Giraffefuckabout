
import './index.css';
import App from './App';


import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";

export default function App() {
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const [label, setLabel] = useState("");
  const giraffeIDs = ["Giraffe_1", "Giraffe_2", "Giraffe_3", "Giraffe_4"]; // Replace with actual IDs

  const fetchImage = async () => {
    const response = await fetch('/api/image');
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    setImage(imageUrl);
    setImageName(response.headers.get('Content-Disposition')?.split('filename=')[1] || "image.jpg");
  };

  useEffect(() => {
    fetchImage();
  }, []);

  const handleLabel = async (selectedLabel) => {
    await fetch('/api/label', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageName, label: selectedLabel })
    });
    setLabel("");
    fetchImage();
  };

  return (
    <div className="p-6 grid grid-cols-2 gap-4">
      <div>
        {image && <img src={image} alt="Unlabeled" className="rounded-xl shadow-lg w-full" />}
        <div className="mt-4">
          <Select onValueChange={setLabel} value={label}>
            {giraffeIDs.map((id) => (
              <SelectItem key={id} value={id}>{id}</SelectItem>
            ))}
          </Select>
          <Button onClick={() => handleLabel(label)} disabled={!label} className="mt-2">Submit Label</Button>
        </div>
        <div className="flex space-x-2 mt-4">
          <Button onClick={() => handleLabel('multiple_giraffes')}>Multiple Giraffes</Button>
          <Button onClick={() => handleLabel('no_giraffe')}>No Giraffe</Button>
          <Button onClick={() => handleLabel('unsure')}>Unsure</Button>
        </div>
      </div>

      <div>
        <iframe src="/reference.pdf" title="Giraffe Reference" className="w-full h-[90vh] border rounded-xl shadow-lg" />
      </div>
    </div>
  );
}
