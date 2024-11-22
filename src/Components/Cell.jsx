import React, {useState, useEffect} from "react";
import { Input } from "@/components/ui/input"

export default function Cell(props) {
    const [value, setValue] = useState(props.value ? props.value : "");
    const [cellColour, setCellColour] = useState("");
    const [isLocked, setIsLocked] = useState(false);

    function verifyCellValue(inputValue) {
        console.log(inputValue);
        if (inputValue > 0 && inputValue < 10){
            setIsLocked(true);
            setCellColour("grey");
            return true;
        }
        else {
            setIsLocked(false);
            setCellColour("red");
            return false;
        }
    }

    function handleInputChange(e) {
        if (verifyCellValue(e.target.value)) {
            setValue(e.target.value);
        }
    }

    return (
        <div className="App">
            <Input value={value} onChange={handleInputChange} className="w-[40px] h-[40px] aspect-square text-center p-0"  />
        </div>
    )
}