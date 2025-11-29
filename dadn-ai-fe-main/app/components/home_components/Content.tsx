import { FaCircle, FaTemperatureHalf } from "react-icons/fa6";
import { IoWaterOutline } from "react-icons/io5";
import { IoSunnyOutline } from "react-icons/io5";
import { BsPeople } from "react-icons/bs";
import { PiFan } from "react-icons/pi";
import { BiSolidToggleRight } from "react-icons/bi";
import { useEffect, useState, useRef } from "react";
import { HiOutlineLightBulb } from "react-icons/hi";
import ToggleButton from "./ToggleButton";
import MicrophoneInfo from "./MicrophoneInfo";

export type ContentProp = {className: string};
type IndicatorProp = {header: string, icon: any, number: number | undefined, measurement: string | undefined, state: string, stateColor: string};

function Indicator({header, icon, number=undefined, measurement=undefined, state, stateColor}: IndicatorProp) {
    return (
        <div className="w-52 h-40 bg-white rounded-2xl flex flex-col justify-between p-3">
            <p className="font-semibold text-center">{header}</p>
        <div className="flex flex-row items-center justify-center gap-2 ">
            {icon} 
            {(number !== undefined) && <p className="font-medium text-3xl whitespace-nowrap">{number} {measurement}</p>}
        </div>
        <div className={stateColor + " w-3/4 text-center mx-auto rounded-2xl font-bold p-1"}>
            {state}
        </div>
    </div>
    )
}

function IndicatorSection() {
    const [temperature, setTemperature] = useState(0);
    const [humidity, setHumidity] = useState(0);
    const [lightIntensity, setLightIntensity] = useState(0);
    const [isPresent, setIsPresent] = useState(false);



    let indicatorList = [
        {heading: "Temperature", icon: <FaTemperatureHalf className="size-16"/>, number: temperature, measurement: "°C", state: "Normal", stateColor: "bg-blue-400"},
        {heading: "Humidity", icon: <IoWaterOutline className="size-16"/>, number: humidity, measurement: "%", state: "Humid", stateColor: "bg-blue-200"},
        {heading: "Light Intensity", icon: <IoSunnyOutline className="size-16"/>, number: lightIntensity, measurement: "lux", state: "Heavy bright", stateColor: "bg-yellow-300"},
        {heading: "Present", icon: <BsPeople className="size-16"/>, state: (isPresent ? "Present" : "Absent"), stateColor: "bg-green-400"},
    ];

    if (temperature < 20) { // Giả sử < 20 là Low
        indicatorList[0].state = "Low";
        indicatorList[0].stateColor = "bg-sky-300"; // Xanh dương nhạt
    } else if (temperature >= 20 && temperature < 30) { // Giả sử 20-29 là Normal
        indicatorList[0].state = "Normal";
        indicatorList[0].stateColor = "bg-yellow-400"; // Vàng
    } else if (temperature >= 30) { // Giả sử >= 30 là High
        indicatorList[0].state = "High";
        indicatorList[0].stateColor = "bg-red-500"; // Đỏ
    }

    if (lightIntensity <= 200) {
        indicatorList[2].state = "Low";
        indicatorList[2].stateColor = "bg-green-400";
    } else if (lightIntensity > 200 && lightIntensity <= 600) {
        indicatorList[2].state = "Medium";
        indicatorList[2].stateColor = "bg-yellow-400";
    } else if (lightIntensity > 600) {
        indicatorList[2].state = "High";
        indicatorList[2].stateColor = "bg-red-500";
    }


    useEffect(() => {
        const source = new EventSource("http://localhost:3000/api/stream/sensor", {
            withCredentials: true,
        });
        // source.addEventListener('message', (e) => {
        //     const data = JSON.parse(e.data);
        // })

        // source.onopen = () => {
        //     elStatus.textContent = "Đã kết nối";
        //     elStatus.classList.remove("err");
        //     elStatus.classList.add("ok");
        // };

        source.addEventListener("sensor", (e) => {
            try {
              const data = JSON.parse(e.data);
              if (data.TEMP !== undefined)
                setTemperature(data.TEMP);

              if (data.HUMI !== undefined)
                setHumidity(data.HUMI);

              if (data.LIGHT !== undefined)
                setLightIntensity(data.LIGHT);
            } catch {
              console.warn("Không parse được JSON:", e.data);
            }
          });

        return () => {
            source.close(); // cleanup on unmount
        };
    }, [])

    return (<div>
        <h1 className="text-2xl font-bold mb-2">Indicators</h1>
        <div className="flex flex-row gap-5">
            {indicatorList.map(indicator => {
                return <Indicator key={indicator.heading} header={indicator.heading}
                    icon={indicator.icon}
                    number={indicator.number}
                    measurement={indicator.measurement}
                    state={indicator.state}
                    stateColor={indicator.stateColor}/>
            })
            }
        </div>
    </div>)
}

type selectorProp = {level: number, setLevel: any, deviceType: string, deviceStatus: string};

function DeviceLevelSelector({level, setLevel, deviceType, deviceStatus}: selectorProp) {
    const fanOptions = ["Breeze", "Normal", "Turbo"];
    const lightOptions = ["Dim", "Normal", "Bright"];
    const options = deviceType === 'fan' ? fanOptions : lightOptions;
    // const [selected, setSelected] = useState(options[level]);
    let selected = options[level - 1];
    console.log("Level " + level);
    console.log(selected);
  

  return (
    <div className="flex justify-center items-center mt-3">
      {options.map((option, index) => (
        <div key={option} className="flex flex-row items-center">
            <div
            key={option}
            className="flex flex-col items-center cursor-pointer"
            onClick={async () => {
                if (deviceStatus === "Off") {
                    alert(`The ${deviceType} is not on!`);
                    return;
                }
                setLevel(index + 1);

                try {
                    const res = await fetch(`http://localhost:3000/api/device/setLevel/${deviceType}`, {
                        method: 'POST',
                        credentials: "include",
                        headers: {
                        'Content-Type': 'application/json',
                        },
                            body: JSON.stringify({
                            level: index + 1, // no need for extra quotes
                        }),
                    });

                    if (!res.ok) {
                        console.error(`Request failed with status: ${res.status}`);
                    } else {
                        const data = await res.json();
                        console.log('Response:', data);
                    }
                    } catch (error) {
                    console.error('Fetch error:', error);
                    }

                
            }}
            >
            {/* Radio circle */}
            <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selected === option ? "border-blue-500" : "border-blue-300"
                }`}
            >
                {selected === option && (
                <FaCircle className="text-blue-500 text-[10px]" />
                )}
            </div>

            {/* Label */}
            <span className="mt-2 text-black">{option}</span>
            </div>
            {index < 2 && <div className="h-[2px] w-10 bg-blue-300 mb-7"></div>}
        </div>
      ))}
      
    </div>
  );
}

type deviceInfoProps = {deviceName: string, deviceStatus: string, toggleName1: string, toggleName2: string, deviceIcon: any};

function DeviceInfo({deviceName, deviceStatus, toggleName1, toggleName2, deviceIcon}: deviceInfoProps) {
    const [powerMode, setPowerMode] = useState("Off");
    const [auto, setAuto] = useState("Manual");
    const [level, setLevel] = useState(0);
    const [isTogglingAuto, setIsTogglingAuto] = useState(false);
    const [isPowerOn, setIsPowerOn] = useState(powerMode === "On");
    const [isAuto, setIsAuto] = useState(false);
    const [tempThreshold, setTempThreshold] = useState("35");
    const [humidityThreshold, setHumidityThreshold] = useState("60");
    const [lightThreshold, setLightThreshold] = useState("300");
    const [inputTemp, setInputTemp] = useState("35");
    const [inputHumidity, setInputHumidity] = useState("60");
    const [inputLight, setInputLight] = useState("300");

    const statusEventSourceRef = useRef<EventSource | null>(null);

    const tempInputRef = useRef<HTMLInputElement>(null);
    const humidityInputRef = useRef<HTMLInputElement>(null);
    const lightInputRef = useRef<HTMLInputElement>(null);

    let name;
    if (deviceName === "Fan") {
        name = "fan";
    } else if (deviceName === "Light") {
        name = "light";
    } else {
        name = "microphone";
    }

    // useEffect(() => {
    //     const deviceInfo = async () => {
    //         try {
    //             const res = await fetch(`http://localhost:3000/api/device/getInfoDevice/${name}`, {
    //                 method: 'GET',
    //                 credentials: "include"
    //             });
    //             if (!res.ok)
    //                 throw new Error(`${res.status}`);
    //             const data = await res.json();
    //             if (data.isActive) {
    //                 setPowerMode("On");
    //                 setIsPowerOn(true);
    //             } else {
    //                 setPowerMode("Off");
    //                 setIsPowerOn(false);
    //             }
    //             if (data.auto) {
    //                 setAuto("Auto");
    //                 setIsAuto(true);
    //             } else {
    //                 setAuto("Manual");
    //                 setIsAuto(false);
    //             }

    //             if (data.name == 'light') {
    //                 setLevel(data.brightness);
    //             } else if (data.name == 'fan') {
    //                 setLevel(data.speed);
    //             }
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     }
    //     deviceInfo();
    // }, [])    
    useEffect(() => {
        const deviceInfo = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/device/getInfoDevice/${name}`, {
                    method: 'GET',
                    credentials: "include"
                });
            if (!res.ok) throw new Error(`${res.status}`);
                const data = await res.json();

                // Set power and auto
                setPowerMode(data.isActive ? "On" : "Off");
                setIsPowerOn(data.isActive);
                setAuto(data.auto ? "Auto" : "Manual");
                setIsAuto(data.auto);

                if (data.name == 'light') {
                    setLevel(data.brightness);
                    // (Giả sử API trả về data.lightThreshold)
                    setLightThreshold(data.lightThreshold || "90");
                    setInputLight(data.lightThreshold || "90");
                } else if (data.name == 'fan') {
                    setLevel(data.speed);
                    // (Giả sử API trả về data.tempThreshold và data.humidityThreshold)
                    setTempThreshold(data.tempThreshold || "25");
                    setInputTemp(data.tempThreshold || "25");
                    setHumidityThreshold(data.humidityThreshold || "90");
                    setInputHumidity(data.humidityThreshold || "90");
                }
            } catch (error) {
                console.error(error);
            }
        }
        deviceInfo();
    }, [name])

// --- useEffect MỚI ĐỂ LẮNG NGHE STATUS KHI isAuto = true ---
    useEffect(() => {
        // Chỉ chạy khi isAuto là true và device là fan hoặc light
        if (isAuto && (name === 'fan' || name === 'light')) {
            console.log(`[${name}] Auto mode ON. Starting status stream listener...`);

            // Đóng kết nối cũ nếu có (phòng trường hợp hi hữu)
            if (statusEventSourceRef.current) {
                 console.log(`[${name}] Closing previous status stream connection before opening a new one.`);
                 statusEventSourceRef.current.close();
            }

            // Tạo kết nối mới
            const source = new EventSource("http://localhost:3000/api/stream/status", {
                 withCredentials: true,
            });
            statusEventSourceRef.current = source; // Lưu lại để có thể đóng sau

            source.onopen = () => {
                 console.log(`[${name}] ✅ Status EventSource Connected!`);
            };

            source.onerror = (err) => {
                 console.error(`[${name}] ❌ Status EventSource Error:`, err);
                 // Tự động đóng khi có lỗi nghiêm trọng
                 if (source.readyState === EventSource.CLOSED) {
                    console.log(`[${name}] Status EventSource connection closed due to error.`);
                    statusEventSourceRef.current = null;
                    // Cân nhắc set isAuto về false hoặc hiển thị lỗi cho người dùng
                    setIsAuto(false);
                    setAuto("Manual");
                    // console.error(`[${name}] Lost connection to status updates. Auto mode might be disabled.`);
                 } else {
                    console.log(`[${name}] Status EventSource encountered a temporary error. Will attempt to reconnect.`);
                 }
            };

            // Hàm xử lý data nhận được
const handleStatusUpdate = (eventData: string) => {
                 try {
                     const data = JSON.parse(eventData);
                     console.log(`[${name}] Received status update object:`, data);

                     let newIsActive: boolean | undefined = undefined;

                     if (name === 'fan' && typeof data.fan === 'boolean') {
                         newIsActive = data.fan;
                         console.log(`[${name}] Extracted fan status: ${newIsActive}`);
                     } else if (name === 'light' && typeof data.light === 'boolean') {
                         newIsActive = data.light;
                         console.log(`[${name}] Extracted light status: ${newIsActive}`);
                     } else {
                         console.log(`[${name}] Ignoring update: Data object does not contain key '${name}' or value is not boolean.`);
                         // Không cần return ở đây nữa, newIsActive sẽ là undefined
                     }

                     // Chỉ gọi cập nhật state nếu newIsActive có giá trị boolean
                     if (typeof newIsActive === 'boolean') {
                         setIsPowerOn(currentIsPowerOn => {
                             if (currentIsPowerOn !== newIsActive) {
                                 console.log(`[${name}] ---> UPDATING UI STATE <--- from ${currentIsPowerOn} to ${newIsActive}`);
                                 setPowerMode(newIsActive ? "On" : "Off");
                                 return newIsActive; // ✅ Trả về boolean
                             } else {
                                 console.log(`[${name}] No UI update needed (received state matches current state).`);
                                 return currentIsPowerOn; // ✅ Trả về boolean (giá trị cũ)
                             }
                         });
                     }
                     // Nếu newIsActive là undefined, không làm gì cả

                 } catch (err) {
                     console.warn(`[${name}] Failed to parse status JSON:`, eventData, err);
                 }
            };

            // Lắng nghe cả event "status" và "message"
            source.addEventListener("status", (e) => {
                console.log(`[${name}] Event 'status' received.`);
                handleStatusUpdate(e.data)
            });
            source.addEventListener("message", (e) => {
                console.log(`[${name}] Event 'message' received.`);
                handleStatusUpdate(e.data)
            }); // Dự phòng nếu BE gửi event mặc định

        }
        // --- Kết thúc khối if (isAuto) ---

        // --- Hàm Cleanup ---
        // Sẽ chạy khi isAuto chuyển thành false HOẶC khi component unmount
        return () => {
            if (statusEventSourceRef.current) {
                console.log(`[${name}] Cleaning up: Closing status stream listener.`);
                statusEventSourceRef.current.close();
                statusEventSourceRef.current = null; // Quan trọng: Đặt lại ref thành null
            }
        };
    }, [isAuto, name]); // Dependency array: chạy lại khi isAuto hoặc name thay đổi
    // --- KẾT THÚC useEffect MỚI ---

    const handleSaveThresholds = async () => {
        const body = (name === 'fan')
            ? { tempThreshold: Number(inputTemp), humidityThreshold: Number(inputHumidity) }
            : { lightThreshold: Number(inputLight) };

        try {
            const res = await fetch(`http://localhost:3000/api/device/setThreshold/${name}`, {
                method: 'POST',
                credentials: "include",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                // Nếu có lỗi, cố gắng đọc message lỗi từ backend
                let errorMsg = `Failed to save thresholds. Status: ${res.status}`;
                try {
                    const errorData = await res.json();
                    errorMsg = errorData.message || errorData.error || errorMsg;
                                        // alert(`Reset failed: ${errorMsg}`);
                } catch (parseError) {
                    // Không parse được lỗi, dùng message mặc định
                }
                throw new Error(errorMsg); // Ném lỗi để catch xử lý
            }
            const data = await res.json();
            console.log('Thresholds saved successfully!', data);
            // Cập nhật lại state "đã lưu"
            if (name === 'fan') {
                setTempThreshold(inputTemp);
                setHumidityThreshold(inputHumidity);
            } else {
                setLightThreshold(inputLight);
            }
            console.log('Thresholds saved!');
            alert('Thresholds saved successfully!')
        } catch (error: any) {
            console.error('Save error:', error);
            alert(`Reset failed: ${error.message}`);
        }
    };

// --- Hàm xử lý Reset Threshold ---
    const handleResetThresholds = async () => { // Thêm async
        try {
            const res = await fetch(`http://localhost:3000/api/device/resetThreshold/${name}`, { // Gọi API reset
                method: 'POST',
                credentials: "include",
            });
            if (!res.ok) {
                let errorMsg = `Failed to reset thresholds. Status: ${res.status}`;
                try {
                    const errorData = await res.json();
                    errorMsg = errorData.message || errorData.error || errorMsg;
                } catch (parseError) {}
                throw new Error(errorMsg);
            }
            const defaultThresholds = await res.json();
            console.log('Thresholds reset successfully!', defaultThresholds);

            console.log("Thresholds reset successfully!");
            alert("Thresholds reset successfully!");

            if (name === 'fan') {
                const defaultTemp = defaultThresholds.temp || "35"; // Giá trị dự phòng
                const defaultHumidity = defaultThresholds.humidity || "60"; // Giá trị dự phòng
                setTempThreshold(defaultTemp);
                setHumidityThreshold(defaultHumidity);
                setInputTemp(defaultTemp); // Cập nhật cả input
                setInputHumidity(defaultHumidity); // Cập nhật cả input
            } else if (name === 'light') {
                 // Giả sử API trả về defaultThresholds.light
                const defaultLight = defaultThresholds.light || "300"; // Giá trị dự phòng
                setLightThreshold(defaultLight);
                setInputLight(defaultLight); // Cập nhật cả input
            }

        } catch (error: any) { // Thêm kiểu 'any'
            // --- Xử lý lỗi ---
            console.error('Reset error:', error);
            alert(`Reset failed: ${error.message}`);
        }
    };

    return (
        <div className="w-xs h-fit bg-white rounded-xl p-3 ">
            <h1 className="text-center font-semibold text-2xl">{deviceName}</h1>
            <div className="grid grid-cols-2">
                <div className="flex flex-col items-center">
                    {deviceIcon}
                    <p className="font-semibold text-xl whitespace-nowrap">Status: {powerMode === 'On' ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="flex flex-col gap-5">
                    <div className="flex flex-row items-center justify-end gap-5">
                        <p className="font-semibold text-xl">{powerMode}</p>
                        {/* <BiSolidToggleRight className="size-15 fill-indigo-600"/> */}
                        <button onClick={async () => {
                            // powerMode === "On" ? setPowerMode("Off") : setPowerMode("On");
                            if (powerMode === "On") {
                                setPowerMode("Off");
                                setIsPowerOn(false);
                            } else {
                                setPowerMode("On");
                                setIsPowerOn(true);
                            }
                            try {
                              const data = await fetch(`http://localhost:3000/api/device/statusToggle/${name}`, {
                                method: 'POST',
                                credentials: "include"
                              });
                              console.log(data);
                            } catch (error) {
                              console.error('Error: ', error);
                            }
                        }}>
                            <ToggleButton isOn={isPowerOn}  name={name} buttonType="statusToggle"/>
                        </button>
                    </div>
                    <div className="flex flex-row items-center justify-end gap-5">
                        <p className="font-semibold text-xl">{toggleName2}</p>
                        <button onClick={async () => {
                            // auto === "Auto" ? setAuto("Manual") : setAuto("Auto");
                            setIsTogglingAuto(true);
                            const nextIsAuto = !isAuto;
                            // if (auto === "Auto") {
                            //     setAuto("Manual");
                            //     setIsAuto(false);
                            // } else {
                            //     setAuto("Auto");
                            //     setIsAuto(true);
                            // }
                            setIsAuto(nextIsAuto);
                            setAuto(nextIsAuto ? "Auto" : "Manual");
                            try {
                              const res = await fetch(`http://localhost:3000/api/device/autoToggle/${name}`, {
                                method: 'POST',
                                credentials: "include",
                                body: JSON.stringify({auto: nextIsAuto})
                              });
                                if (res.ok) {
                                        const responseData = await res.json(); // Đọc JSON từ response
                                        console.log(`[${name}] Auto toggle successful:`, responseData); // Log JSON data
                                    } else {
                                        console.error(`[${name}] Auto toggle failed:`, res.status, res.statusText);
                                        // (Optional) Cố gắng đọc thêm thông tin lỗi từ body nếu có
                                        try {
                                            const errorData = await res.json();
                                            console.error(`[${name}] Error details:`, errorData);
                                        } catch (parseError) {
                                            console.warn(`[${name}] Could not parse error response body.`);
                                        }
                                        // Trả lại trạng thái UI cũ
                                        setIsAuto(!nextIsAuto);
                                        setAuto(nextIsAuto ? "Manual" : "Auto");
                                    }
                            } catch (error) {
                              console.error('Error: ', error);
                            }
                        }}>
                            <ToggleButton isOn={isAuto} name={name} buttonType="autoToggle"/>
                        </button>
                    </div>
                </div>
            </div>
            <hr className="border-gray-200"/>
            <div className="flex items-center justify-evenly h-fit w-full">
                    {/* Selector */}
                <p className="font-semibold text-gray-600 text-sm mb-1">{name === 'fan' ? 'Speed' : 'Brightness'}</p>
                <DeviceLevelSelector level={level} setLevel={setLevel} deviceType={name} deviceStatus={powerMode}/>
            </div>

            {/* --- THÊM MỚI SECTION THRESHOLD --- */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                {/* Hàng 1: Tiêu đề và Nút bấm */}
                <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-gray-600 text-sm">Activation Threshold</p>
                    {/* Nhóm nút: Nằm ngang, căn phải */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleResetThresholds}
                            className="text-sm bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300">
                            Reset
                        </button>
                        <button
                            onClick={handleSaveThresholds}
                            className="bg-indigo-600 text-white py-1.5 px-5 rounded-lg hover:bg-indigo-700 font-semibold text-sm"> 
                            Save
                        </button>
                    </div>
                </div>

                {/* Hàng 2: Ô Input */}
                <div className="mt-1"> {/* Giảm margin */}
                    {/* Inputs cho Quạt (Fan): Nằm ngang */}
                    {name === 'fan' && (
                        <div className="flex flex-row gap-2"> {/* Đổi thành flex-row */}
                            {/* Input Nhiệt độ */}
                            <div
                                onClick={() => tempInputRef.current?.focus()} // Bấm vào div để focus input
                                className="bg-gray-100 rounded-lg p-2 flex items-center justify-between flex-1 cursor-text" // Thêm flex-1 và cursor-text
                            >
                                <input
                                    ref={tempInputRef} // Thêm ref
                                    type="number"
                                    value={inputTemp}
                                    onChange={(e) => setInputTemp(e.target.value)}
                                    // Bỏ width cố định, dùng flex-1. Chỉnh font size
                                    className="text-xl font-bold w-full text-left outline-none bg-transparent appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                                <span className="text-lg font-bold text-gray-500 ml-1">°C</span> {/* Thêm cách lề trái */}
                            </div>
                            {/* Input Độ ẩm */}
                            <div
                                onClick={() => humidityInputRef.current?.focus()} // Bấm vào div để focus input
                                className="bg-gray-100 rounded-lg p-2 flex items-center justify-between flex-1 cursor-text" // Thêm flex-1 và cursor-text
                            >
                                <input
                                    ref={humidityInputRef} // Thêm ref
                                    type="number"
                                    value={inputHumidity}
                                    onChange={(e) => setInputHumidity(e.target.value)}
                                     // Bỏ width cố định, dùng flex-1. Chỉnh font size
                                    className="text-xl font-bold w-full text-left outline-none bg-transparent appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                                <span className="text-lg font-bold text-gray-500 ml-1">%</span> {/* Thêm cách lề trái */}
                            </div>
                        </div>
                    )}

                    {/* Input cho Đèn (Light) */}
                    {name === 'light' && (
                        <div
                            onClick={() => lightInputRef.current?.focus()} // Bấm vào div để focus input
                            className="bg-gray-100 rounded-lg p-2 flex items-center justify-between cursor-text" // Thêm cursor-text
                        >
                            <input
                                ref={lightInputRef} // Thêm ref
                                type="number"
                                value={inputLight}
                                onChange={(e) => setInputLight(e.target.value)}
                                // Chỉnh font size
                                className="text-xl font-bold w-full text-left outline-none bg-transparent appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                            <span className="text-lg font-bold text-gray-500 ml-1">lux</span> {/* Thêm cách lề trái */}
                        </div>
                    )}
                </div>
            </div>
            {/* --- KẾT THÚC SECTION MỚI --- */}

        </div>
    )
}

function DeviceInfoSection() {
    let deviceList = [
        {
            deviceName: "Fan",
            deviceStatus: "Active",
            toggleName1: "Power",
            toggleName2: "Auto",
            deviceIcon: <PiFan className="size-35"/>,
        },
        {
            deviceName: "Light",
            deviceStatus: "Active",
            toggleName1: "Power",
            toggleName2: "Auto",
            deviceIcon: <HiOutlineLightBulb className="size-35"/>,
        },
    ];

    return (<div>
        <h1 className="font-bold text-2xl">Devices</h1>
        <div className="flex flex-row gap-10 wrap">
            {deviceList.map(item => {
                return <DeviceInfo key={item.deviceName} deviceName={item.deviceName}
                deviceIcon={item.deviceIcon}
                deviceStatus={item.deviceStatus}
                toggleName1={item.toggleName1}
                toggleName2={item.toggleName2}
                />   
            }      
            )}
            <MicrophoneInfo />
        </div>
    </div>)
}

export default function Content({className = ""}: ContentProp) {
    return (<div className={className}>
        <IndicatorSection />
        <DeviceInfoSection />
    </div>)
}