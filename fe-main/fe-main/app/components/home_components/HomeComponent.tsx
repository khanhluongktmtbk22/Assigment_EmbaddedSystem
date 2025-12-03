import Navbar from "../Navbar";
import Content from "./Content";
import Menu from "./Menu";

export default function HomeComponent() {
    return (<>
        <Navbar />
        <div className="bg-white text-black flex flex-row min-h-screen">
            <Menu className="w-3xs flex-1"/>
            <Content className="flex-6 bg-gray-200 px-20 py-10"/>
        </div>
    </>)
}