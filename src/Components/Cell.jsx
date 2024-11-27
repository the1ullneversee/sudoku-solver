import React, {useState, useEffect} from "react";

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
            <input className={`w-full h-[40px] text-center focus:outline-none focus:bg-primary/10 ${cell.isLocked ? 'bg-base-200 font-semibold' : 'bg-base-100'}`} value={value}
                   onChange={!isLocked ? handleChange : null} readOnly={isLocked}/>
        </div>
    )
}