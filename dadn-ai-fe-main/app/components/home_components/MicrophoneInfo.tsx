import { useEffect, useState } from "react";
import { GrMicrophone } from "react-icons/gr";

export default function MicrophoneInfo() {
    const [powerMode, setPowerMode] = useState(false);
    useEffect(() => {
        const getMicInfo = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/device/getInfoDevice/microphone`, {
                    method: 'GET',
                    credentials: "include"
                });
                if (!res.ok)
                    throw new Error(`${res.status}`);
                const data = await res.json();
                setPowerMode(data.isActive);
            } catch (error) {
                console.error(error);
            }    
        }
        getMicInfo();
    }, [])
    return (<div className="w-xs h-fit bg-white rounded-xl p-3 ">
        <h1 className="text-center font-semibold text-2xl">Microphone</h1>
        <div className="flex justify-center">
            <GrMicrophone size={175} className={"p-5 cursor-pointer hover:bg-gray-200 rounded-full m-5 " + (powerMode && "text-blue-400")}
                onClick={async () => {
                    setPowerMode(!powerMode);
                    try {
                        const data = await fetch(`http://localhost:3000/api/device/statusToggle/microphone`, {
                            method: 'POST',
                            credentials: "include"
                        });
                    } catch (error) {
                        console.error('Error: ', error);
                    }
                }}
            />
        </div>
    </div>)
}