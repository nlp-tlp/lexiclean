import React from 'react'
import { Menu, Item } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

export default function ContextMenu({menu_id, tokenInfo, addMetaTag}) {

    const handleItemClick = (field) => {
        // Handles menu when auxiliary tags are requested
        console.log('menu action on aux field', field);
        addMetaTag(field, !tokenInfo[field])
    }

    return (
        <Menu id={menu_id}>
            <Item style={{ backgroundColor: tokenInfo['domain_specific'] ? '#8F8F8F': null}} onClick={() => handleItemClick("domain_specific")}>Domain Specific Term</Item>
            {/* <Separator/> */}
            <Item style={{ backgroundColor: tokenInfo['abbreviation'] ? '#8F8F8F': null}} onClick={() => handleItemClick("abbreviation")}>
            Abbreviation
            </Item>
            <Item style={{ backgroundColor: tokenInfo['noise'] ? '#8F8F8F': null}} onClick={() => handleItemClick("noise")}>
            Noise
            </Item>
            <Item style={{ backgroundColor: tokenInfo['english_word'] ? '#8F8F8F': null}} onClick={() => handleItemClick("english_word")}>
            English Word
            </Item>
            <Item style={{ backgroundColor: tokenInfo['unsure'] ? '#8F8F8F': null}} onClick={() => handleItemClick("unsure")}>
            Unsure
            </Item>
            <Item style={{ backgroundColor: tokenInfo['removed'] ? '#8F8F8F': null}} onClick={() => handleItemClick("removed")}>
            Removed
            </Item>
        </Menu>
    )
}
