import { useState } from "react";

type buttonProps = {isOn: boolean, name: string, buttonType: string};

export default function ToggleButton({isOn, name, buttonType}: buttonProps) {
  // const [enabled, setEnabled] = useState(isOn);
  let enabled = isOn;
  console.log(name + ": " + enabled);

  

  return (
    <div
    //   onClick={async () => {
    //     setEnabled(!enabled);
    //     try {
    //       const data = await fetch(`http://localhost:3000/api/device/${buttonType}/${name}`, {
    //         method: 'POST',
    //       });
    //       console.log(data);
    //     } catch (error) {
    //       console.error('Error: ', error);
    //     }
    // }}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </div>
  );
}
