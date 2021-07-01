import React from 'react'
import { Menu, Item, Submenu, theme } from "react-contexify";
import { IoMdArrowDropright} from 'react-icons/io'
import "react-contexify/dist/ReactContexify.css";

const DEFAULT_MAPS = ['ua', 'rp', 'st'];    // Note this excludes 'en' 

export default function ContextMenu({ menu_id,
                                        bgColourMap,
                                        tokenInfo,
                                        addMetaTag,
                                        removeMetaTag,
                                        activeMaps
                                    }) {

    const Apply = (field) => {
        // console.log('apply one', field)
        const isSingle = true;
        addMetaTag(field, !tokenInfo[field], isSingle)
    }

    const ApplyAll = (field) => {
        // console.log('apply all', field)
        const isSingle = false;
        addMetaTag(field, !tokenInfo[field], isSingle)
    }

    const Remove = (field) => {
        removeMetaTag(field)
    }

    return (
        <Menu id={menu_id}>
            {
                Object.keys(bgColourMap).filter(key => !DEFAULT_MAPS.includes(key) && [...activeMaps, 'en'].includes(key)).map(item => (
                    <Submenu
                        label={<div style={{ backgroundColor: tokenInfo.meta_tags[item] ? bgColourMap[item] : null, padding: '5px', borderRadius: '5px'}}>{ item }</div>}
                        arrow={<IoMdArrowDropright/>}
                        theme={theme.light}
                    >
                        <Item onClick={() => Apply(item)}>Apply</Item>
                        <Item onClick={() => ApplyAll(item)}>Apply All</Item>
                        <Item onClick={() => Remove(item)}>Remove</Item>
                    </Submenu>
                ))
            }
        </Menu>
    )
}
