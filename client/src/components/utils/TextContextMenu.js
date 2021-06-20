import React from 'react'
import { Menu, Item } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

export default function TextContextMenu({menu_id, textString, setTextString, updateText, originalText}) {

    const Apply = (textString) => {
        const isSingle = true;
        updateText(textString, isSingle)
    }

    const ApplyAll = (textString) => {
        console.log('apply all')
        // const isSingle = false;
    }

    const Undo = () => {
        setTextString(originalText);
    }

    return (
        <Menu id={menu_id}>
            <Item onClick={() => Apply(textString)}>Apply</Item>
            <Item disabled onClick={() => ApplyAll(textString)}>Apply All</Item>
            <Item onClick={() => Undo()}>Undo</Item>
        </Menu>
    )
}
