import React from 'react'
import { Toast } from 'react-bootstrap';

export default function ContextToast({ showToast, setShowToast, toastInfo }) {
    return (
            <Toast
                show={showToast}
                onClose={() => setShowToast(false)}
                style={{
                    position: 'fixed',
                    top: 90,
                    right: 20,
                    width: 200,
                    zIndex: 1000
                }}
                delay={5000}
                autohide
            >
                <Toast.Header>
                    <strong className="mr-auto">
                        {toastInfo.type === 'replacement' ? 'Replacement' : 'Meta Tag' }</strong>
                    <small>just now</small>
                </Toast.Header>
                <Toast.Body>
                    {
                        toastInfo.type === 'replacement' ?
                        <>
                        <p style={{marginBottom: '0.25em'}}>Replacement was made!</p>
                        Original: <strong>{ toastInfo.content.original }</strong> <br/>
                        Replacement: <strong>{ toastInfo.content.replacement}</strong><br/>
                        Count: <strong>{ toastInfo.content.count }</strong>
                        </>
                        :
                        <>
                        <p style={{marginBottom: '0.25em'}}>Updated token meta tag!</p>
                        Token: <strong>{ toastInfo.content.original }</strong> <br/>
                        Tag: <strong>{ toastInfo.content.metaTag }</strong> <br/>
                        Bool: <strong>{ toastInfo.content.metaTagValue ? 'true' : 'false' }</strong> <br/>
                        Count: <strong>{ toastInfo.content.count }</strong>
                        </>
                    }
                </Toast.Body>
            </Toast>
    )
}
