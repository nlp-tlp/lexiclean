import React from 'react'
import AnnotationTable from './AnnotationTable'
import Header from './Header'
import Footer from './Footer'

const texts = ['hello world', 'hello 123 world', 'goodbye tyler world', 'goodbye world'];
const tokens_en = ['hello', 'goodbye'];
const tokens_ds = ['123', 'tyler'];

export default function Page() {
    return (
        <>
        <Header />
        <AnnotationTable 
            texts={texts}
            tokens_en={tokens_en}
            tokens_ds={tokens_ds}
        />
        <Footer />
        </>
    )
}
