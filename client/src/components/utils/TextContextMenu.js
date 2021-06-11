import React from 'react'
import { Menu, Item } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

export default function TextContextMenu({menu_id, textString, updateText}) {

    const Apply = (textString) => {
        console.log('apply one')
        const isSingle = true;
        updateText(textString, isSingle)
    }

    const ApplyAll = (textString) => {
        console.log('apply all')
        const isSingle = false;
    }

    // const Undo = (field) => {
    //     // removeMetaTag(field)
    // }


    return (
        <Menu id={menu_id}>
            <Item onClick={() => Apply(textString)}>Apply</Item>
            <Item onClick={() => ApplyAll(textString)}>Apply All</Item>
            {/* <Item onClick={() => Undo()}>Undo</Item> */}
        </Menu>
    )
}
