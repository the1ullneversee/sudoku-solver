import React, {useState, useEffect} from "react";
import { Input } from "@/components/ui/input"

export default function Cell({cell, onChange}) {
    const [value, setValue] = useState(cell.value);
    const [cellColour, setCellColour] = useState(cell.cellColour);
    const [isLocked, setIsLocked] = useState(cell.isLocked);

    const handleChange = (e) => {
        const newValue = e.target.value;

        // Handle empty/backspace case first
        if (newValue === "") {
            setValue("");
            onChange({ target: { value: null }});
            return;
        }

        if (newValue.length < 1) return;

        const numValue = parseInt(newValue);
        if (!isNaN(numValue) && numValue >= 1 && numValue <= 9) {
            console.log("Valid input");
            setValue(numValue);
            onChange({ target: { value: numValue } });
        }
    };

    useEffect(() => {

        setValue(cell.value);
        setCellColour(cell.cellColour);
        setIsLocked(cell.isLocked);
        console.log(`Setting cell with ${value} ${cellColour} ${isLocked}`);
    }, [cell])

    return (
        <div className="App">
            <Input value={value} onChange={!isLocked ? handleChange : null} className="w-[40px] h-[40px] aspect-square text-center p-0" style={{backgroundColor: cellColour}} readOnly={isLocked}/>
        </div>
    )
}