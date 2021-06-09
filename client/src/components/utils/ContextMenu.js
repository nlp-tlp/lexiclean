import React from 'react'
import { Menu, Item, Submenu, theme } from "react-contexify";
import { IoMdArrowDropright} from 'react-icons/io'
import "react-contexify/dist/ReactContexify.css";


const menuItems = [
    {'key': "domain_specific", 'description': 'Domain Specific Term'},
    {'key': "abbreviation", 'description': 'Abbreviation'},
    {'key': "noise", 'description': 'Noise'},
    {'key': "english_word", 'description': 'English Word'},
    {'key': "unsure", 'description': 'Unsure'},
    {'key': "removed", 'description': 'Remove'},
    {'key': "sensitive", 'description': 'Sensitive'},
]

// Color map for token classifications
// TODO: put these somewhere common to all functions using the bg mapping
const bgColorMap = {
    'domain_specific': 'red',
    'abbreviation': 'purple',
    'noise': 'blue',
    'english_word': '#D9D9D9',
    'unsure': 'brown', 
    'removed': 'yellow',
    'sensitive': 'pink',
}

export default function ContextMenu({menu_id, tokenInfo, addMetaTag, removeMetaTag}) {

    const Apply = (field) => {
        console.log('apply one', field)
        const isSingle = true;
        addMetaTag(field, !tokenInfo[field], isSingle)
    }

    const ApplyAll = (field) => {
        console.log('apply all', field)
        const isSingle = false;
        addMetaTag(field, !tokenInfo[field], isSingle)
    }

    const Remove = (field) => {
        removeMetaTag(field)
    }


    return (
        <Menu id={menu_id}>
            {
                menuItems.map(item => (
                    <Submenu
                        label={<div style={{ backgroundColor: tokenInfo[item.key] ? bgColorMap[item.key] : null, padding: '5px', borderRadius: '5px'}}>{ item.description }</div>}
                        arrow={<IoMdArrowDropright/>}
                        theme={theme.light}
                    >
                        <Item onClick={() => Apply(item.key)}>Apply</Item>
                        <Item onClick={() => ApplyAll(item.key)}>Apply All</Item>
                        <Item onClick={() => Remove(item.key)}>Remove</Item>
                    </Submenu>
                ))
            }
        </Menu>
    )
}
